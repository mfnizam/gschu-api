@echo off

REM move into the backups directory
CD C:\Users\Nizam\Desktop\MFNIZAM\Pertamina\Database

REM Create a file name for the database output which contains the date and time. Replace any characters which might cause an issue.
set filename=%date:~0,2%%date:~3,2%%date:~-4%_%time:~0,2%%time:~3,2%%time:~6,2%_WIB

mongodump --uri "mongodb://mfnizam:mfnizam@mfnizam-shard-00-00.qtvyt.mongodb.net:27017/gschu?authSource=admin&replicaSet=atlas-lazezm-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true" --out=%filename%

echo BACKUP COMPLETE