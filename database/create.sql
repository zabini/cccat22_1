drop schema if exists ccca;

create schema ccca;

create table ccca.account (
    account_id uuid primary key,
    name text,
    email text,
    document text,
    password text
);
