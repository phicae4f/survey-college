import {Router} from "express"

export const questionsRouter = Router()

questionsRouter.get("/", (req, res) => {
    return res.send("ss")
})