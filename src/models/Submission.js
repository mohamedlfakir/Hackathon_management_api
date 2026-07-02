function createSubmission(data = {}) {
    return {
        id: data.id ?? null,
        team_id: data.team_id ?? null,
        title: data.title ?? "",
        description: data.description ?? "",
        github_url: data.github_url ?? "",
        figma_url: data.figma_url ?? "",
        presentation_path: data.presentation_path ?? null,
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null
    };
}

module.exports = {
    createSubmission
};