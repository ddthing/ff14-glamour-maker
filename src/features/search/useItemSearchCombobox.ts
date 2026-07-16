import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { isMatchingSlot } from '../../domain/itemCategories';
import { useDebounce } from '../../hooks/useDebounce';
import { useFF14Search, type FF14Item } from '../../hooks/useFF14Search';
import type { EquipmentPart } from '../../types';
import { preloadSearchItems } from './loadSearchItems';

interface UseItemSearchComboboxOptions {
  value: string;
  currentSlot?: EquipmentPart;
  onNameChange: (name: string) => void;
  onSelect: (item: FF14Item) => void;
}

export function useItemSearchCombobox({
  value,
  currentSlot,
  onNameChange,
  onSelect,
}: UseItemSearchComboboxOptions) {
  const { results, isLoading, error, searchItems, clearResults } = useFF14Search();
  const [localValue, setLocalValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(localValue, 800);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProgrammaticRef = useRef(false);
  const isFirstMountRef = useRef(true);
  const listboxId = useId();

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      isProgrammaticRef.current = true;
      setLocalValue(value);
      return;
    }

    isProgrammaticRef.current = true;
    setLocalValue(value);
    clearResults();
    setOpen(false);
    setSelectedIndex(-1);

    let focusTimeout: number | null = null;
    if (inputRef.current && window.matchMedia('(pointer: fine)').matches) {
      focusTimeout = window.setTimeout(() => inputRef.current?.focus(), 10);
    }

    return () => {
      if (focusTimeout !== null) window.clearTimeout(focusTimeout);
    };
  }, [clearResults, currentSlot, value]);

  useEffect(() => {
    if (!isFocused || isProgrammaticRef.current) return;
    if (debouncedQuery.trim().length >= 1) {
      void searchItems(debouncedQuery, currentSlot);
      setOpen(true);
      setSelectedIndex(-1);
      onNameChange(debouncedQuery);
      return;
    }

    clearResults();
    setOpen(false);
    setSelectedIndex(-1);
    if (debouncedQuery === '') onNameChange('');
  }, [clearResults, currentSlot, debouncedQuery, isFocused, onNameChange, searchItems]);

  useEffect(() => {
    const handleOutsideMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown);
  }, []);

  const filteredResults = useMemo(
    () => currentSlot ? results.filter(item => isMatchingSlot(item, currentSlot)) : results,
    [currentSlot, results],
  );

  const handleSelect = (item: FF14Item) => {
    isProgrammaticRef.current = true;
    setLocalValue('');
    onSelect(item);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    isProgrammaticRef.current = false;
    setLocalValue(event.target.value);
    if (!event.target.value) {
      clearResults();
      setOpen(false);
    }
  };

  const handleFocus = () => {
    void preloadSearchItems(currentSlot);
    setIsFocused(true);
    if (localValue.trim().length >= 1) setOpen(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) onNameChange(localValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setSelectedIndex(-1);
      return;
    }
    if (!open || filteredResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(previous => previous < filteredResults.length - 1 ? previous + 1 : previous);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(previous => previous > 0 ? previous - 1 : 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selectedItem = filteredResults[selectedIndex] ?? filteredResults[0];
      if (selectedItem) handleSelect(selectedItem);
    }
  };

  const shouldShowDropdown = open && (
    filteredResults.length > 0
    || isLoading
    || (debouncedQuery.trim().length >= 1 && (filteredResults.length === 0 || !!error))
  );

  return {
    containerRef,
    inputRef,
    listboxId,
    localValue,
    debouncedQuery,
    filteredResults,
    selectedIndex,
    isLoading,
    error,
    shouldShowDropdown,
    handleChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleSelect,
    preload: () => preloadSearchItems(currentSlot),
    setSelectedIndex,
  };
}
