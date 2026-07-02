function createEvaluation(data = {}) {
    return {
        id: data.id ?? null,
        submission_id: data.submission_id ?? null,
        judge_id: data.judge_id ?? null,
        comments: data.comments ?? "",
        created_at: data.created_at ?? null,
        updated_at: data.updated_at ?? null
    };
}

module.exports = {
    createEvaluation
};