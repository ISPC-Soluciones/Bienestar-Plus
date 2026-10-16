"""Sprint 4 automated API checks for the Bienestar Plus app."""
"""Discovery hook for the structured backend test suite."""

from pathlib import Path


def load_tests(loader, standard_tests, pattern):
    tests_directory = Path(__file__).resolve().parent
    backend_directory = tests_directory.parents[1]
    return loader.discover(
        start_dir=str(tests_directory),
        pattern=pattern or "test*.py",
        top_level_dir=str(backend_directory),
    )
