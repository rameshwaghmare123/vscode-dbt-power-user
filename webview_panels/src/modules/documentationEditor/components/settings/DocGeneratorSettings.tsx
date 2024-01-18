import { OptionType, Button, Label, Select, Stack } from "@uicore";
import { SettingsIcon } from "@assets/icons";
import { useState } from "react";
import RightSidePanel from "@modules/panel/RightSidePanel";
import { Languages, Persona } from "../docGenerator/constants";
import { ActionMeta } from "react-select";
import useDocumentationContext from "@modules/documentationEditor/state/useDocumentationContext";
import { updateUserInstructions } from "@modules/documentationEditor/state/documentationSlice";
import { panelLogger } from "@modules/logger";

const DocGeneratorSettings = (): JSX.Element => {
  const {
    dispatch,
    state: { userInstructions },
  } = useDocumentationContext();
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const handleChange = (value: unknown, meta: ActionMeta<unknown>) => {
    if (!meta.name) {
      return;
    }
    panelLogger.info("updating user instructions", meta.name, value);
    dispatch(
      updateUserInstructions({ [meta.name]: (value as OptionType).value }),
    );
  };

  return (
    <>
      <Button outline onClick={() => setShowSettingsPanel(true)}>
        <SettingsIcon /> Settings
      </Button>
      {showSettingsPanel ? (
        <RightSidePanel title="Settings">
          <Stack direction="column">
            <h3>Configure your doc generation with options</h3>
            <Stack direction="column">
              <Label>
                Language
                <Select
                  name="language"
                  defaultValue={{
                    label: userInstructions.language,
                    value: userInstructions.language,
                  }}
                  onChange={handleChange}
                  options={Languages.map((l) => ({ label: l, value: l }))}
                />
              </Label>
              <Label>
                Persona
                <Select
                  name="persona"
                  defaultValue={{
                    label: userInstructions.persona,
                    value: userInstructions.persona,
                  }}
                  onChange={handleChange}
                  options={Persona.map((l) => ({ label: l, value: l }))}
                />
              </Label>
            </Stack>
          </Stack>
        </RightSidePanel>
      ) : null}
    </>
  );
};

export default DocGeneratorSettings;
