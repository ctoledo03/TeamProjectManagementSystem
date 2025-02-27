const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    token: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Team {
    id: ID!
    teamName: String!
    description: String
    teamSlogan: String
    createdDate: String!
    status: String!
    members: [User]
    projects: [Project]
  }

  type Project {
    id: ID!
    projectName: String!
    description: String
    status: String!
    startDate: String
    endDate: String
    teams: [Team]
  }

  type Query {
    # Public queries
    me: User

    # Team member queries
    viewUsers: [User]
    viewTeamDetails(teamId: ID!): Team
    viewAssignedProjects(userId: ID!): [Project]

    # Admin queries
    listTeams: [Team]
    listProjects: [Project]
    listMembers(teamId: ID!): [User]
  }

  type Mutation {
    # Auth mutations
    login(username: String!, password: String!): AuthPayload!
    logout: Boolean!
    
    # Team member mutations
    updateProjectStatus(projectId: ID!, status: String!): Project
    
    # Admin mutations
    createUser(username: String!, email: String!, password: String!, role: String!): User
    createTeam(teamName: String!, description: String!, teamSlogan: String!): Team
    assignProjectToTeam(projectId: ID!, teamIds: [ID!]): Project
    createProject(projectName: String!, description: String!, teamIds: [ID!], startDate: String!, endDate: String): Project
  }
`;

module.exports = typeDefs;