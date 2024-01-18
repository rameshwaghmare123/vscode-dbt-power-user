import CopilotProvider from "@modules/copilot/CopilotProvider";
import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import appSlice, { initialState } from "./appSlice";
import { ContextProps } from "./types";
import useListeners from "./useListeners";

export const AppContext = createContext<ContextProps>({
  state: initialState,
  dispatch: () => null,
});

const AppProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [state, dispatch] = useReducer(
    appSlice.reducer,
    appSlice.getInitialState(),
  );

  useListeners(dispatch);

  useEffect(() => {
    if (!state.theme) {
      return;
    }
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const values = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );

  return (
    <AppContext.Provider value={values}>
      <CopilotProvider>
        <div className="App">{children}</div>
      </CopilotProvider>
    </AppContext.Provider>
  );
};

export default AppProvider;
