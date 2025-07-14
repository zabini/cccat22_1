import express, { Request, Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import {validateCpf} from "./validateCpf";
const app = express();
app.use(express.json());

const connection = pgp()("postgres://postgres:123456@db:5432/app");

function validName(name: string) {
    if (typeof name !== 'string') return false;
    return name.trim().split(' ').length >= 2;
}

function validEmail(email: string) {
    if (typeof email !== 'string') return false;
    email = email.trim();
    if (email.indexOf('@') == -1 || email.indexOf(' ') != -1) return false;
    const splited = email.split('@').filter((val: any): boolean => val != '')
    if (splited.length != 2) return false;
    if (splited[1].indexOf('.') == -1 ) return false;
    return true;
}

async function existEmail(email: string) {
    const result = await connection.query('select 1 from ccca.account where email = $1 limit 1', [email]);
    return result.length > 0;
}

function validatePassword(password: string){
    if (typeof password !== 'string') return false;
    if (password.length < 8) return false;
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) return false;
    return true;
}

app.post("/signup", async (req: Request, res: Response) => {
    const account = req.body;
    console.log("/signup", account);
    if (!validName(account.name)) {
        res.status(422);
        res.json({type: 'http://localhsot:3000/account-guides',title: 'Name must be valid',status: 422,});
        return;
    }
    if (!validEmail(account.email)) {
        res.status(422);
        res.json({type: 'http://localhsot:3000/account-guides',title: 'Email must be valid',status: 422,});
        return;
    }
    if (await existEmail(account.email)) {
        res.status(422);
        res.json({type: 'http://localhsot:3000/account-guides',title: 'Email already in use, choose another',status: 422,});
        return;
    }
    if (!validateCpf(account.document)) {
        res.status(422);
        res.json({type: 'http://localhsot:3000/account-guides',title: 'CPF must be a valid one',status: 422,});
        return;
    }
    if (!validatePassword(account.password)) {
        res.status(422);
        res.json({type: 'http://localhsot:3000/account-guides',title: 'Password must respect guides',status: 422,});
        return;
    }
    const accountId = crypto.randomUUID();
    await connection.query(
        "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
        [
            accountId,
            account.name.trim(),
            account.email.trim(),
            account.document,
            account.password,
        ]
    );
    res.json({
        accountId,
    });
});

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    console.log(`/accounts/${accountId}`);
    const [account] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
    res.json(account);
});

app.post("/deposit/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    const deposit = req.body;
    await connection.query(
        "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
        [
            accountId,
            deposit.assetId,
            deposit.quantity,
        ]
    );

    res.status(201);
    res.send();
});

app.post("/withdraw/:accountId", async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    const deposit = req.body;
    await connection.query(
        "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
        [
            accountId,
            deposit.assetId,
            deposit.quantity * -1,
        ]
    );
    res.status(201);
    res.send();
});


app.listen(3000);
