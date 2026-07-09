const teamRepository = require("../repositories/team.repository");
const hackathonRepository = require("../repositories/hackathon.repository");

const AppError = require("../utils/AppError");

/**
 * Get all teams
 */
async function getAllTeams() {
    return await teamRepository.findAll();
}

/**
 * Get team by id
 */
async function getTeamById(id) {

    const team = await teamRepository.findById(id);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    return team;

}

/**
 * Create team
 */
async function createTeam(data, userId) {

    const hackathon = await hackathonRepository.findById(data.hackathon_id);

    if (!hackathon) {
        throw new AppError("Hackathon not found", 404);
    }

    const existingTeam = await teamRepository.findUserTeam(
        data.hackathon_id,
        userId
    );

    if (existingTeam) {
        throw new AppError(
            "You already belong to a team in this hackathon",
            409
        );
    }

    const team = await teamRepository.create({
        ...data,
        captain_id: userId
    }, userId);

    await teamRepository.joinTeam(team.id, userId);
    await hackathonRepository.registerTeam(hackathon.id,team.id)
    return team;

}

/**
 * Update team
 */
async function updateTeam(teamId, userId, data)
 {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    if (team.captain_id !== userId) {
    throw new AppError(
        "Only the team captain can modify the team",
        403
    );
    }

    return await teamRepository.update(teamId, {
        name: data.name ?? team.name,
        description: data.description ?? team.description,
        avatar_path: data.avatar_path ?? team.avatar_path
    });

}

/**
 * Delete team
 */
async function deleteTeam(teamId, userId) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can delete the team",
            403
        );
    }

    await teamRepository.deleteTeam(teamId);

    return {
        message: "Team deleted successfully"
    };

}

/**
 * Join team
 */
async function joinTeam(teamId, userId) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    if (
        req.user.role === "PARTICIPANT" &&
        team.leader_id !== req.user.id
    ) {
        throw new AppError("Only the team leader can add members", 403);
    }

    const alreadyMember = await teamRepository.isMember(
        teamId,
        userId
    );

    if (alreadyMember) {
        throw new AppError(
             "User is already a member of this team",
            409
        );
    }

    const existingTeam = await teamRepository.findUserTeam(
        team.hackathon_id,
        userId
    );

    if (existingTeam) {
        throw new AppError(
            "User already belongs to another team in this hackathon",
            409
        );
    }

    return await teamRepository.joinTeam(
        teamId,
        userId
    );

}


/**
 * Remove member from team
 */
async function removeMember(teamId, userId, currentUser) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    // Participants can only manage their own team
    if (
        currentUser.role === "PARTICIPANT" &&
        team.leader_id !== currentUser.id
    ) {
        throw new AppError(
            "Only the team leader can remove members",
            403
        );
    }

    const member = await teamRepository.isMember(
        teamId,
        userId
    );

    if (!member) {
        throw new AppError(
            "User is not a member of this team",
            404
        );
    }

    // Prevent removing the leader
    if (team.leader_id === userId) {
        throw new AppError(
            "The team leader cannot be removed",
            400
        );
    }

    await teamRepository.removeMember(
        teamId,
        userId
    );
}


/**
 * Leave team
 */
async function leaveTeam(teamId, userId) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    const member = await teamRepository.isMember(
        teamId,
        userId
    );

    if (!member) {
        throw new AppError(
            "You are not a member of this team",
            404
        );
    }

    await teamRepository.leaveTeam(
        teamId,
        userId
    );

    return {
        message: "You left the team successfully"
    };

}

/**
 * Get members
 */
async function getMembers(teamId) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    return await teamRepository.getMembers(teamId);

}

/**
 * Update avatar
 */
async function updateAvatar(teamId, userId, avatarPath) {

    const team = await teamRepository.findById(teamId);

    if (!team) {
        throw new AppError("Team not found", 404);
    }

    if (team.captain_id !== userId) {
        throw new AppError(
            "Only the team captain can update the avatar",
            403
        );
    }
    
    return await teamRepository.update(
        teamId,
        {
            name: team.name,
            description: team.description,
            avatar_path: avatarPath
        }
    );

}

/**
 * Get user's team in a hackathon
 */
async function getUserTeam(hackathonId, userId) {
    return await teamRepository.findUserTeam(
        hackathonId,
        userId
    );
}


module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    getMembers,
    getUserTeam,
    updateAvatar,
    removeMember,
};