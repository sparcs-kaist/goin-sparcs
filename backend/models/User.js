const { degrees, caculateDegrees } = require('../seeders/degrees');
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const { getCommits, getPRs, getMyRepos } = require('../utils/github-api');

class User extends Model { }
const interleave = (arr, thing) => [].concat(...arr.map(n => [n, thing])).slice(0, -1)

User.init({
    sparcs_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    github_id: DataTypes.STRING,
    commits: DataTypes.INTEGER,
    prs: DataTypes.INTEGER,
    games: DataTypes.INTEGER,
    repos: DataTypes.STRING,
}, { sequelize });

user_utils = {
    getUser: users => users.map((userObj) => {
        const repos = JSON.parse(userObj.repos)
        const total_pt = userObj.commits + userObj.prs*5 + repos.length*10 + userObj.games*5;
        const degree = caculateDegrees(total_pt);

        return {
            sparcs_id: userObj.sparcs_id,
            github_id: userObj.github_id,
            commits: userObj.commits,
            prs: userObj.prs,
            games: userObj.games,
            repos: repos,
            repos_num: repos.length,
            total_pt: total_pt,
            degree: degree
        }
    })

}

User.handlers = {
    addUser: async (sparcs_id, github_id) => {
        console.time('commits')
        let commits = await getCommits(github_id)
        console.timeEnd('commits')
        console.time('prs')
        let prs = await getPRs(github_id)
        console.timeEnd('prs')
        console.time('repos')
        let repos = await getMyRepos(github_id)
        console.timeEnd('repos')

        await User.create({
            sparcs_id,
            github_id,
            commits,
            prs,
            repos: JSON.stringify(repos),
            games: 0
        })
    },
    updateUser: async (sparcs_id, update_obj) => {
        await User.update(update_obj, { where: { sparcs_id } })
    },
    getUser: async (sparcs_id) => {
        return await User.findOne({ where: { sparcs_id } })
    },
    deleteUser: async (sparcs_id) => {
        return await User.destroy({ where: { sparcs_id } })
    },
    getUserBySort: async () => {
        let data = user_utils.getUser(await User.findAll({}))
        data.sort((a, b) => a.total_pt - b.total_pt)
        return data
    },
    deleteAll: async () => {
        await User.destroy({ where: {}, truncate: true })
    }
}


module.exports = User;