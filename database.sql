-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL CHECK (
        role IN ('ADMIN', 'ORGANIZER', 'PARTICIPANT', 'JUDGE')
    ),

    bio TEXT,

    avatar_path VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- HACKATHONS
-- =====================================================

CREATE TABLE hackathons (

    id SERIAL PRIMARY KEY,

    title VARCHAR(200) NOT NULL,

    theme VARCHAR(200) NOT NULL,

    description TEXT,

    rules TEXT,

    location VARCHAR(255),

    is_online BOOLEAN DEFAULT FALSE,

    start_date TIMESTAMP NOT NULL,

    end_date TIMESTAMP NOT NULL,

    registration_deadline TIMESTAMP,

    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (
        status IN ('OPEN','CLOSED','FINISHED','UPCOMING')
    ),

    created_by INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- PARTICIPANTS REGISTERED TO HACKATHONS
-- =====================================================

CREATE TABLE hackathon_participants (

    id SERIAL PRIMARY KEY,

    hackathon_id INTEGER NOT NULL,

    user_id INTEGER,

	team_id INTEGER,

    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(hackathon_id, user_id),

    FOREIGN KEY (hackathon_id)
        REFERENCES hackathons(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- TEAMS
-- =====================================================

CREATE TABLE teams (

    id SERIAL PRIMARY KEY,

    hackathon_id INTEGER NOT NULL,

    name VARCHAR(100) NOT NULL,

	captain_id INTEGER NOT NULL,

	logo_path VARCHAR(255),
	
    description TEXT,

    created_by INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (hackathon_id)
        REFERENCES hackathons(id)
        ON DELETE SET NULL,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

	FOREIGN KEY (captain_id)
        REFERENCES users(id)
        ON DELETE SET NULL 
);

-- =====================================================
-- TEAM MEMBERS
-- =====================================================

CREATE TABLE team_members (

    id SERIAL PRIMARY KEY,

    team_id INTEGER NOT NULL,

    user_id INTEGER NOT NULL,

    is_leader BOOLEAN DEFAULT FALSE,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(team_id, user_id),

    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- SUBMISSIONS
-- =====================================================

CREATE TABLE submissions (

    id SERIAL PRIMARY KEY,

    team_id INTEGER,

	user_id INTEGER,

	hackathon_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    github_url TEXT,

    figma_url TEXT,

    presentation_path VARCHAR(255),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,
		
	FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

	FOREIGN KEY (hackathon_id)
		REFERENCES hackathons(id)
		ON DELETE CASCADE
);

-- =====================================================
-- EVALUATION CRITERIA
-- =====================================================

CREATE TABLE evaluation_criteria (

    id SERIAL PRIMARY KEY,

   	code VARCHAR(50) UNIQUE NOT NULL,
	   
    name VARCHAR(100) NOT NULL,

    max_score INTEGER NOT NULL
);

-- =====================================================
-- EVALUATIONS
-- =====================================================

CREATE TABLE evaluations (

    id SERIAL PRIMARY KEY,

    submission_id INTEGER NOT NULL,

    judge_id INTEGER NOT NULL,

    criterion_id INTEGER NOT NULL,

    score INTEGER NOT NULL,

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (submission_id)
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    FOREIGN KEY (judge_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (criterion_id)
        REFERENCES evaluation_criteria(id)
        ON DELETE CASCADE,

    UNIQUE(submission_id, judge_id, criterion_id)
);

CREATE TABLE hackathon_judges (
    hackathon_id INT NOT NULL,
    judge_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (hackathon_id, judge_id),

    CONSTRAINT fk_hackathon_judges_hackathon
        FOREIGN KEY (hackathon_id)
        REFERENCES hackathons(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_hackathon_judges_judge
        FOREIGN KEY (judge_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
-- =====================================================
-- DEFAULT EVALUATION CRITERIA
-- =====================================================

INSERT INTO evaluation_criteria (code, name, max_score)
VALUES
('innovation', 'Innovation', 10),
('technical_quality', 'Qualité technique', 10),
('solution_relevance', 'Pertinence de la solution', 10),
('presentation', 'Présentation', 10);