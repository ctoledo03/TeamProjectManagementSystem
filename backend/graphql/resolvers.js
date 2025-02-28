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
    // Public queries
    me: async (_, __, context) => {
      checkAuth(context);
      return await User.findById(context.user.id);
    },

    // Team member queries
    viewTeamDetails: async (_, { teamId }, context) => {
      checkAuth(context);
      return await Team.findById(teamId).populate('members').populate('projects');
    },

    viewAssignedProjects: async (_, __, context) => {
      checkAuth(context);
      // First find all teams the user is a member of
      const teams = await Team.find({ members: context.user.id });
      const teamIds = teams.map(team => team._id);
      
      // Then find all projects assigned to those teams
      const projects = await Project.find({ teams: { $in: teamIds } })
        .populate('teams');
      
      return projects;
    },

    viewMyTeams: async (_, __, context) => {
      checkAuth(context);
      return await Team.find({ members: context.user.id })
        .populate('members')
        .populate({
          path: 'projects',
          model: 'Project',
          select: 'projectName description status startDate endDate'
        });
    },

    // Admin queries
    viewUsers: async (_, __, context) => {
      checkAdmin(context);
      return await User.find({});
    },

    listTeams: async (_, __, context) => {
      checkAdmin(context);
      return await Team.find({}).populate('members').populate('projects');
    },
    
    listProjects: async (_, __, context) => {
      checkAdmin(context);
      return await Project.find({}).populate('teams');
    },
    
    listMembers: async (_, { teamId }, context) => {
      checkAdmin(context);
      const team = await Team.findById(teamId).populate('members');
      return team.members;
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

    // Public mutations
    register: async (_, { username, email, password, registrationCode }) => {
      try {
        const existingUser = await User.findOne({ 
          $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
          throw new GraphQLError(
            existingUser.username === username 
              ? 'Username already exists' 
              : 'Email already exists',
            {
              extensions: {
                code: 'BAD_USER_INPUT'
              }
            }
          );
        }

        // Check registration code to determine role
        let role = 'MEMBER';
        if (registrationCode) {
          switch(registrationCode) {
            case process.env.ADMIN_REGISTRATION_CODE:
              role = 'ADMIN';
              break;
            // Add more cases for different roles if needed
          }
        }

        const user = await User.create({
          username,
          email,
          password,
          role
        });

        return user;
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        });
      }
    },

    // Team member mutations
    updateProjectStatus: async (_, { projectId, status }, context) => {
      checkAuth(context);
      return await Project.findByIdAndUpdate(projectId, { status }, { new: true });
    },

    updateTeamStatus: async (_, { teamId, status }, context) => {
      checkAuth(context);
      // Check if user is a member of the team
      const team = await Team.findById(teamId);
      if (!team.members.includes(context.user.id)) {
        throw new GraphQLError('Not authorized to update this team', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      return await Team.findByIdAndUpdate(teamId, { status }, { new: true });
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
        teams: teamIds || [],
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: 'Pending'
      });
      return project.populate('teams');
    },

    assignUsersToTeam: async (_, { teamId, userIds }, context) => {
      checkAdmin(context);
      return await Team.findByIdAndUpdate(
        teamId,
        { members: userIds },
        { new: true }
      ).populate('members');
    },

    updateUserRole: async (_, { userId, role }, context) => {
      checkAdmin(context);
      const user = await User.findById(userId);
      
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      
      if (!['ADMIN', 'MEMBER'].includes(role)) {
        throw new GraphQLError('Invalid role', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      
      user.role = role;
      await user.save();
      return user;
    },
  }
};

module.exports = resolvers;
