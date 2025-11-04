import { AppDispatch, RootState } from "@/store";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// custom hooks for typed redux usage
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
