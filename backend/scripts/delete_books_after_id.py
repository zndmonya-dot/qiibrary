#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Utility script to delete books (and related records) whose IDs are greater than a cutoff.

Usage:
    cd backend
    python -m scripts.delete_books_after_id --cutoff 17350 --dry-run
"""

import argparse
import logging
import sys
from datetime import datetime

from app.database import SessionLocal
from app.models.book import Book, BookQiitaMention, BookYouTubeLink

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


def delete_books_after(cutoff: int, dry_run: bool = False):
    """Delete books and related rows whose IDs exceed the cutoff."""
    db = SessionLocal()
    try:
        logger.info("Starting cleanup: deleting records with book_id > %s", cutoff)
        logger.info("Dry-run mode: %s", dry_run)

        mentions_deleted = (
            db.query(BookQiitaMention)
            .filter(BookQiitaMention.book_id > cutoff)
            .delete(synchronize_session=False)
        )
        logger.info("book_qiita_mentions to delete: %s", mentions_deleted)

        youtube_links_deleted = (
            db.query(BookYouTubeLink)
            .filter(BookYouTubeLink.book_id > cutoff)
            .delete(synchronize_session=False)
        )
        logger.info("book_youtube_links to delete: %s", youtube_links_deleted)

        books_deleted = (
            db.query(Book).filter(Book.id > cutoff).delete(synchronize_session=False)
        )
        logger.info("books to delete: %s", books_deleted)

        if dry_run:
            db.rollback()
            logger.info("Dry-run complete. No changes committed.")
        else:
            db.commit()
            logger.info("Deletion committed at %s", datetime.utcnow())
    except Exception:
        logger.exception("Failed to delete books after %s", cutoff)
        db.rollback()
        raise
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="Delete book records whose ID is greater than the provided cutoff."
    )
    parser.add_argument("--cutoff", type=int, required=True, help="Book ID cutoff value")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate deletions without committing changes.",
    )
    args = parser.parse_args()
    delete_books_after(args.cutoff, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

