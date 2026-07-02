function createTeam(data = {}) {
    return {
        id: data.id ?? null,
        hackathon_id: data.hackathon_id ?? null,
        captain_id: data.captain_id ?? null,
        name: data.name ?? "",
        description: data.description ?? "",
        avatar_path: data.avatar_path ?? null,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null
    };
}

module.exports = {
    createTeam
};