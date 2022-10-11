@echo off

REM move into the backups directory
@REM CD C:\Users\Nizam\Desktop\MFNIZAM\Pertamina\Server\db_backup

REM Create a file name for the database output which contains the date and time. Replace any characters which might cause an issue.
set filename=%date:~0,2%%date:~3,2%%date:~-4%_%time:~0,2%%time:~3,2%%time:~6,2%_WIB__local_json

mongoexport --db=gschu -c=acaras --out=%filename%/acaras.json
mongoexport --db=gschu -c=acs --out=%filename%/acs.json
mongoexport --db=gschu -c=atks --out=%filename%/atks.json
mongoexport --db=gschu -c=dokumens --out=%filename%/dokumens.json
mongoexport --db=gschu -c=fungsis --out=%filename%/fungsis.json
mongoexport --db=gschu -c=furnitures --out=%filename%/furnitures.json
mongoexport --db=gschu -c=galons --out=%filename%/galons.json
mongoexport --db=gschu -c=jabatans --out=%filename%/jabatans.json
mongoexport --db=gschu -c=kategoris --out=%filename%/kategoris.json
mongoexport --db=gschu -c=krps --out=%filename%/krps.json
mongoexport --db=gschu -c=messes --out=%filename%/messes.json
mongoexport --db=gschu -c=notifikasis --out=%filename%/notifikasis.json
mongoexport --db=gschu -c=otps --out=%filename%/otps.json
mongoexport --db=gschu -c=peralatans --out=%filename%/peralatans.json
mongoexport --db=gschu -c=permintaans --out=%filename%/permintaans.json
mongoexport --db=gschu -c=rdps --out=%filename%/rdps.json
mongoexport --db=gschu -c=rumputs --out=%filename%/rumputs.json
mongoexport --db=gschu -c=snacks --out=%filename%/snacks.json
mongoexport --db=gschu -c=tokens --out=%filename%/tokens.json
mongoexport --db=gschu -c=users --out=%filename%/users.json
mongoexport --db=gschu -c=versis --out=%filename%/versis.json
mongoexport --db=gschu -c=wilayahs --out=%filename%/wilayahs.json
mongoexport --db=gschu -c=zonas --out=%filename%/zonas.json

echo BACKUP COMPLETE