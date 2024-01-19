import { IncomingMessageProps } from "@modules/app/types";
import { panelLogger } from "@modules/logger";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import documentationSlice, {
  initialState,
  setGenerationsHistory,
  setProject,
  updateColumnsInCurrentDocsData,
  updateCurrentDocsData,
  updateUserInstructions,
} from "./state/documentationSlice";
import {
  DBTDocumentation,
  DocsGenerateUserInstructions,
  MetadataColumn,
} from "./state/types";
import { ContextProps } from "./types";
import { getGenerationsInModel } from "./utils";

export const DocumentationContext = createContext<ContextProps>({
  state: initialState,
  dispatch: () => null,
});

const DocumentationProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [state, dispatch] = useReducer(
    documentationSlice.reducer,
    documentationSlice.getInitialState(),
  );

  const onMesssage = useCallback(
    (
      event: MessageEvent<
        IncomingMessageProps & {
          docs?: DBTDocumentation;
          project?: string;
          columns?: MetadataColumn[];
        }
      >,
    ) => {
      const { command } = event.data;
      switch (command) {
        case "renderDocumentation":
          dispatch(updateCurrentDocsData(event.data.docs));
          dispatch(setProject(event.data.project));
          break;
        case "renderColumnsFromMetadataFetch":
          if (event.data.columns) {
            dispatch(
              updateColumnsInCurrentDocsData({ columns: event.data.columns }),
            );
          }
          break;
        default:
          break;
      }
    },
    [],
  );

  const loadGenerationsHistory = (project: string, model: string) => {
    getGenerationsInModel(project, model)
      .then((data) => {
        dispatch(setGenerationsHistory(data));
      })
      .catch((err) =>
        panelLogger.error("error while loading generations history", err),
      );
  };

  useEffect(() => {
    if (!state.project || !state.currentDocsData?.name) {
      return;
    }

    const userInstructions = localStorage.getItem("userInstructions");
    if (userInstructions) {
      dispatch(
        updateUserInstructions(
          JSON.parse(userInstructions) as DocsGenerateUserInstructions,
        ),
      );
    }
    loadGenerationsHistory(state.project, state.currentDocsData.name);
  }, [state.project, state.currentDocsData?.name]);

  useEffect(() => {
    window.addEventListener("message", onMesssage);
    return () => {
      window.removeEventListener("message", onMesssage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "userInstructions",
      JSON.stringify(state.userInstructions),
    );
  }, [state.userInstructions]);

  const values = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );

  return (
    <DocumentationContext.Provider value={values}>
      <div>{children}</div>
    </DocumentationContext.Provider>
  );
};

export default DocumentationProvider;
