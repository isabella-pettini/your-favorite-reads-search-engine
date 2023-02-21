const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).populate('savedBooks');

        return userData;
      }

      throw new AuthenticationError('Please login first.');
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);

        return { token, user };
    },
    login: async (parent, { username, email, password }) => {
        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
            throw new AuthenticationError('No user found.');
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw new AuthenticationError('Password incorrect.');
        }

        const token = signToken(user);
        return { token, profile }
    },
    saveBook: async (parent, { userId, savedBook }, context) => {
        if (context.user) {
            return User.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: { savedBooks: savedBook }
                },
                { new: true }
            )
        }

        throw new AuthenticationError('Please login first.');
    },
    removeBook: async (parent, { savedBook }, context) => {
        if (context.user) {
            return User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: savedBook } },
                { new: true }
            );
        }

        throw new AuthenticationError('Please login first.');
    }

}
};

module.exports = resolvers;