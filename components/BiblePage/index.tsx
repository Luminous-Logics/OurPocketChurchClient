/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import StoreProvider from "@/store/provider";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { useAppSelector, useAppDispatch } from "@/hooks";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import Button from "@/components/Button";
import {
  setSelectedBibleId,
  setSelectedBookId,
  setSelectedChapterId,
  fetchBibleBooks,
  fetchBibleChapters,
  fetchBibleChapterContent,
} from "@/store/slices/bible";
import "./styles.scss";


const BiblePageComp = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<"today" | "read">("read");
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Get data from Redux store
  const {
    selectedBibleId,
    selectedBookId,
    selectedChapterId,
    books,
    chapters,
    chapterContent,
    loadingBooks,
    loadingChapters,
    loadingChapterContent,
  } = useAppSelector((state) => state.bible);

  // Initialize with English Bible on mount
  useEffect(() => {
    if (!selectedBibleId) {
      dispatch(setSelectedBibleId("bba9f40183526463-01"));
    }
  }, []);

  // Fetch books when Bible is selected
  useEffect(() => {
    if (selectedBibleId) {
      dispatch(fetchBibleBooks(selectedBibleId));
    }
  }, [selectedBibleId, dispatch]);

  // Fetch chapters when book is selected
  useEffect(() => {
    if (selectedBibleId && selectedBookId) {
      dispatch(fetchBibleChapters(selectedBibleId, selectedBookId));
    }
  }, [selectedBibleId, selectedBookId, dispatch]);

  // Fetch chapter content when chapter is selected
  useEffect(() => {
    if (selectedBibleId && selectedChapterId) {
      dispatch(fetchBibleChapterContent(selectedBibleId, selectedChapterId));
    }
  }, [selectedBibleId, selectedChapterId, dispatch]);

  // Streaming effect for chapter content
  useEffect(() => {
    if (!chapterContent?.content) {
      setDisplayedText("");
      return;
    }

    setIsStreaming(true);
    setDisplayedText("");
    
    const fullText = chapterContent.content;
    let currentIndex = 0;

    // Adjust speed here: lower = faster, higher = slower
    const streamSpeed = 15; // milliseconds per character
    
    const streamInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        // Stream in chunks for smoother effect
        const chunkSize = 2;
        const nextChunk = fullText.slice(currentIndex, currentIndex + chunkSize);
        setDisplayedText(prev => prev + nextChunk);
        currentIndex += chunkSize;
      } else {
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, streamSpeed);

    return () => {
      clearInterval(streamInterval);
      setIsStreaming(false);
    };
  }, [chapterContent?.content]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bookId = e.target.value;
    dispatch(setSelectedBookId(bookId));
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chapterId = e.target.value;
    dispatch(setSelectedChapterId(chapterId));
  };

  const handleLanguageToggle = () => {
    const newBibleId = selectedBibleId === "bba9f40183526463-01"
      ? "de295e9ba65f6d0f-01"
      : "bba9f40183526463-01";

    // Reset everything when language changes
    dispatch(setSelectedBibleId(newBibleId));
    dispatch(setSelectedBookId(""));
    dispatch(setSelectedChapterId(""));
  };

  const getCurrentLanguage = () => {
    return selectedBibleId === "de295e9ba65f6d0f-01" ? "മലയാളം" : "English";
  };

  const handlePreviousChapter = () => {
    if (!chapterContent?.previous) return;
    dispatch(setSelectedChapterId(chapterContent.previous.id));
  };

  const handleNextChapter = () => {
    if (!chapterContent?.next) return;
    dispatch(setSelectedChapterId(chapterContent.next.id));
  };

  const getSelectedBook = () => {
    return books.find(b => b.id === selectedBookId);
  };

  const getSelectedChapter = () => {
    return chapters.find(c => c.id === selectedChapterId);
  };

  return (
    <div className="bible-page-content">
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1>Holy Bible</h1>
            <p className="subtitle">Read the Word of God daily</p>
          </div>
          <button className="language-toggle" onClick={handleLanguageToggle}>
            {getCurrentLanguage()}
          </button>
        </div>
      </div>

      <div className="bible-tabs">
        <button
          className={`tab-button ${activeTab === "today" ? "active" : ""}`}
          onClick={() => setActiveTab("today")}
        >
          Today&apos;s Word
        </button>
        <button
          className={`tab-button ${activeTab === "read" ? "active" : ""}`}
          onClick={() => setActiveTab("read")}
        >
          Read Bible
        </button>
      </div>

      {activeTab === "read" && (
        <>
          <div className="bible-controls-section">
            <div className="controls-row">
              <div className="control-group-inline">
                <label className="control-label">Select Book</label>
                <select
                  id="book-select"
                  value={selectedBookId}
                  onChange={handleBookChange}
                  disabled={!selectedBibleId || loadingBooks}
                  className="form-select-inline"
                >
                  <option value="">
                    {loadingBooks ? "Loading books..." : selectedBookId ? getSelectedBook()?.nameLong : "Select a book"}
                  </option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.nameLong}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group-inline">
                <label className="control-label">Chapter</label>
                <select
                  id="chapter-select"
                  value={selectedChapterId}
                  onChange={handleChapterChange}
                  disabled={!selectedBookId || loadingChapters}
                  className="form-select-inline"
                >
                  <option value="">
                    {loadingChapters ? "Loading chapters..." : selectedChapterId ? getSelectedChapter()?.number : "Select a chapter"}
                  </option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loadingChapterContent && (
            <div className="loading-state">
              <p>Loading chapter...</p>
            </div>
          )}

          {!loadingChapterContent && chapterContent && (
            <Card className="chapter-card">
              <div className="chapter-header">
                <h2>{chapterContent.reference}</h2>
              </div>
              <div className="chapter-content">
                <div className={`chapter-text ${isStreaming ? 'streaming' : ''}`}>
                  {displayedText}
                  {isStreaming && <span className="cursor-blink">▋</span>}
                </div>
              </div>

              <div className="chapter-navigation">
                <Button
                  variant="outline"
                  onClick={handlePreviousChapter}
                  disabled={!chapterContent.previous || isStreaming}
                  icon={<ChevronLeft size={18} />}
                >
                  Previous Chapter
                </Button>

                <Button
                  variant="ghost"
                  icon={<Volume2 size={18} />}
                  disabled={isStreaming}
                >
                  Listen
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNextChapter}
                  disabled={!chapterContent.next || isStreaming}
                >
                  Next Chapter
                  <ChevronRight size={18} />
                </Button>
              </div>

              {chapterContent.copyright && (
                <div className="copyright-notice">
                  <small>{chapterContent.copyright}</small>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {activeTab === "today" && (
        <Card className="today-word-card">
          <div className="today-content">
            <h3>Today&apos;s Word</h3>
            <p>Coming soon - Daily scripture readings</p>
          </div>
        </Card>
      )}
    </div>
  );
};

const BiblePage = () => {
  return (
    <StoreProvider>
      <BiblePageComp />
    </StoreProvider>
  );
};

export default BiblePage;