@echo off

REM move into the backups directory
@REM CD C:\Users\Nizam\Desktop\MFNIZAM\Pertamina\Server\db_backup

REM Create a file name for the database output which contains the date and time. Replace any characters which might cause an issue.
set filename=%date:~0,2%%date:~3,2%%date:~-4%_%time:~0,2%%time:~3,2%%time:~6,2%_WIB__local

mongodump --db=gschu  --out=%filename%

echo BACKUP COMPLETE