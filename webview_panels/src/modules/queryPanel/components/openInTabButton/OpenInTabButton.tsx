import { executeRequestInAsync } from "@modules/app/requestExecutor";
import NewFeatureIndicator from "@modules/newFeature/NewFeatureIndicator";
import useQueryPanelState from "@modules/queryPanel/useQueryPanelState";
import { Button } from "@uicore";

const OpenInTabButton = (): JSX.Element | null => {
  const queryTabData = useQueryPanelState();
  const handleClick = () => {
    executeRequestInAsync("queryResultTab:render", { queryTabData });
  };
  if (!queryTabData?.queryResults) {
    return null;
  }
  return (
    <NewFeatureIndicator featureKey="open-query-results-in-tab-clicked">
      <Button
        outline
        onClick={handleClick}
        buttontext="Open in Tab"
        showtext={true}
      />
    </NewFeatureIndicator>
  );
};

export default OpenInTabButton;
