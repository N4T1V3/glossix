# Use the current bilingual import pipeline; do not reintroduce the old word-ID join.
import pathlib,runpy
runpy.run_path(str(pathlib.Path(__file__).resolve().parent/'tools'/'repair-dictionaries.py'),run_name='__main__')
