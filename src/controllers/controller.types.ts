export interface IRequest {
    method?: string,
    url?: string,
    query?: {
        op?: string,
        difficulty?: number,
        user_id?: string,
        question_id?: string,
        question_type?: string,
        limit?: number,
        key?: string,
        input?: string,
        channel_id?: string,
        anchor_message_id?: string,
        msg_count?: number
    },
    body: {
        user_id?: string,
        email?: string,
        password?: string,
        question_id?: string,
        question_type: string,
        time_taken?: number,
        alias?: string
    },
    profile?: {
        _id?: string,
        hashed_password?: string,
        salt?: string,
        photo?: {
            contentType: string,
            data: Buffer
        },
        updated?: number,
        save?: Function,
    },
    auth?: {
        _id?: string
    }
}

export interface IResponse {
    status: Function,
    json: Function,
    set: Function,
    send: Function,
    sendFile: Function,
    cookie: Function,
    clearCookie: Function
}
