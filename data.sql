\c biztime

DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;



CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
  code varchar(10) primary key,
  industry varchar(50) not null unique
);

CREATE TABLE company_industries (
  comp_code text not null,
  ind_code text not null,
  constraint comp_code foreign key(comp_code) references companies ON DELETE CASCADE,
  constraint ind_code foreign key(ind_code) references industries ON DELETE CASCADE,
  primary key (comp_code, ind_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('spec', 'Specialized','Sweet bicycles');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

insert into industries (code, industry) values ('acct','Accounting');
insert into industries (code, industry) values ('tech','High Technology');
insert into industries (code, industry) values ('devices','Devices & Gadgets');

INSERT INTO company_industries 
  (comp_code, ind_code)
  VALUES 
  ('apple','tech'),
  ('apple','devices'),
  ('ibm','acct'),
  ('ibm','tech');


