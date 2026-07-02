function createUser(data = {}) {
    return {
        id: data.id ?? null,
        username: data.username ?? "",
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        email: data.email ?? "",
        password_hash: data.password_hash ?? "",
        role: data.role ?? "PARTICIPANT",
        avatar_path: data.avatar_path ?? null,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null
    };
}

module.exports = {
    createUser
};  