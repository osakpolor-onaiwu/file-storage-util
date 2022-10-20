import { validateSchema } from '../utils/validatespec';
import throwcustomError from '../utils/customerror'
import joi from 'joi';
import Logger from '../utils/Logger';
import axios from 'axios';
import { service_return } from '../interface/service_response';
import path from 'path';

const spec = joi.object({
    user_email: joi.string().email().required(),
    user_name: joi.string().optional(),
    subject: joi.string().required(),
    link: joi.string().optional(),
})


export async function notifier(data: any) {

    try {
        const params = validateSchema(spec, data);
        const payload = {
            "sender": {
                "name": `${process.env.SENDER_NAME}`,
                "email": `${process.env.SENDER_EMAIL}`
            },
            "to": [
                {
                    "email": `${params.user_email}`,
                    "name": `${params.user_name}`
                }
            ],
            "subject": `${params.subject}`,
            "htmlContent": `<html>
                <head></head>
                <body>
                    <p>Hello ${params.user_name},
                    </p>This please verify your email address. click the link below.
                        ${params.link || `http://localhost:8000`}
                    </p>
                </body>
            </html>
            `
        }
        const headers = {
            "content-type": 'application/json',
            "api-key": `${process.env.SEDIBLUE_API_KEY}`,
            "accept": 'application/json'
        }
        const link = await axios.post(`${process.env.SENDIBLUE_API}`, payload, { headers });
        if (!link) throw new Error('error getting link');
        console.log('notifier-----', link);
        const res: service_return = {
            data: link.data,
            message: `Email notification sent`
        }
        return res
    } catch (error: any) {
        console.log('notifier-error---',error);
        Logger.error([error.stack,error.message], { service: 'notifier-error' })
        throwcustomError(error.message);
    }
}