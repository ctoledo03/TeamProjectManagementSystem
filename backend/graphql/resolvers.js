const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const checkAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError('Not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    });
  }
};

const checkAdmin = (context) => {
  checkAuth(context);
  if (context.user.role !== 'ADMIN') {
    throw new GraphQLError('Not authorized. Admin access required.', {
      extensions: {
        code: 'FORBIDDEN'
      }
    });
  }
};

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      checkAuth(context);
      return context.user;
    },

    // Team member queries
    viewUsers: async (_, __, context) => {
      checkAuth(context);
      return await User.find();
    },

    viewTeamDetails: async (_, { teamId }, context) => {
      checkAuth(context);
      return await Team.findById(teamId).populate('members').populate('projects');
    },
    
    viewAssignedProjects: async (_, { userId }, context) => {
      checkAuth(context);
      // Users can only view their own projects unless they're admin
      if (userId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized to view other users projects', {
          extensions: {
            code: 'FORBIDDEN'
          }
        });
      }
      const teams = await Team.find({ members: userId });
      const teamIds = teams.map(team => team._id);
      return await Project.find({ team: { $in: teamIds } });
    },

    // Admin queries
    listTeams: async (_, __, context) => {
      checkAdmin(context);
      return await Team.find().populate('members').populate('projects');
    },
    
    listProjects: async (_, __, context) => {
      checkAdmin(context);
      return await Project.find().populate('teams');
    },
    
    listMembers: async (_, { teamId }, context) => {
      checkAdmin(context);
      const team = await Team.findById(teamId).populate('members');
      return team ? team.members : [];
    },
  },

  Mutation: {
    // Auth mutations
    login: async (_, { username, password }, { res }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new GraphQLError('Invalid credentials', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Set HTTPOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      });

      return {
        token, 
        user,
      };
    },

    // Team member mutations
    updateProjectStatus: async (_, { projectId, status }, context) => {
      checkAuth(context);
      return await Project.findByIdAndUpdate(projectId, { status }, { new: true });
    },

    // Admin mutations
    createUser: async (_, { username, email, password, role }, context) => {
      checkAdmin(context); 
      return await User.create({ username, email, password, role });
    },

    createTeam: async (_, { teamName, description, teamSlogan }, context) => {
      checkAdmin(context);
      return await Team.create({ 
        teamName, 
        description, 
        teamSlogan, 
        createdDate: new Date(), 
        status: 'Active' 
      });
    },

    assignProjectToTeam: async (_, { projectId, teamIds }, context) => {
      checkAdmin(context);
      return await Project.findByIdAndUpdate(
        projectId, 
        { teams: teamIds }, 
        { new: true }
      ).populate('teams');
    },

    logout: async (_, __, { res }) => {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      });
      return true;
    },

    createProject: async (_, { projectName, description, teamIds, startDate, endDate }, context) => {
      checkAdmin(context);
      const project = await Project.create({
        projectName,
        description,
        teams: teamIds || [],  // Allow for no teams initially
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: 'Pending'
      });
      return project.populate('teams');
    },
  }
};

module.exports = resolvers;
