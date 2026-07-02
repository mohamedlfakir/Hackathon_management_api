function createHackathon(data = {}) {
    return {
        id: data.id ?? null,
        title: data.title ?? "",
        theme: data.theme ?? "",
        description: data.description ?? "",
        rules: data.rules ?? "",
        location: data.location ?? "",
        is_online: data.is_online ?? false,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        registration_deadline: data.registration_deadline ?? null,
        status: data.status ?? "UPCOMING",
        created_by: data.created_by ?? null,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null
    };
}

module.exports = {
    createHackathon
};