// IMPORTANT: make sure to register new ops here
export type QuestionType = 'addition' | 'subtraction' | 'multiplication' | 'division' |
    'fractions' | 'decimals' | 'prime_factorization' | 'lcm' | 'hcf' |
    'exponents' | 'scientific_notation' | 'radicals' | 'summation' | 'percentage' |
    'logarithms';

export interface IQuestion {
    _id?: string,
    title?: string,
    author?: string,
    description?: string,
    question_type?: QuestionType
    question_syllabus?: string,
    question_difficulty?: number,
    question_text?: string,
    question_latex: string,
    correct_answer?: string,
    base_award?: number,
    time_limit?: number,
    time_award?: number,
    time_penalty?: number,
    display_type?: string,
    notes?: string
}

export interface IAbortedQuestion {
    user_id: string,
    question_id: string,
    question_type: QuestionType
}

export interface IUserAnswer {
    user_id: string,
    author: string,
    question_id: string,
    question_type: QuestionType
    question_category?: string,
    question_difficulty: number,
    user_answer: string,
    is_correct: boolean,
    time_taken: number,
    rating: number
}

export interface IUser {
    name: string,
    level_details?: Array<any>,
    email: string,
    hashed_password: string,
    salt: string,
    about: string,
    photo: Buffer
}
