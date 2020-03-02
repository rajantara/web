 
CREATE TABLE bread
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    string          VARCHAR(15)     NOT NULL,
    integer         INTEGER         NOT NULL,
    float           REAL            NOT NULL,
    date            VARCHAR(12)     NOT NULL,
    boolean         VARCHAR(5)      NOT NULL    
);

INSERT INTO bread (string, integer, float, date, boolean)
VALUES ('kamu', 24, 4.96, '24/10/2019', 'true');