import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
const app = express();
app.use(express.json());

const connection = pgp()("postgres://postgres:123456@db:5432/app");

app.post("/signup", async (req: Request, res: Response) => {
    const account = req.body;
    console.log("/signup", account);
    if (typeof account.name !== "string" || account.name.trim().split(' ').length <= 1){
        res.status(422);
        res.json({
            "type": "http://localhsot:3000/error",
            "title": "Name must be valid",
            'status': 422,
        });
        return;
    }

    const accountId = crypto.randomUUID();
    await connection.query("insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)", [accountId, account.name, account.email, account.document, account.password]);
    res.json({
        accountId
    });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId
    console.log(`/accounts/${accountId}`);
    const [account] = await connection.query("select * from ccca.account", []);
    res.json(account);
});

app.listen(3000);
