import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LikeIcon, DislikeIcon } from "@assets/icons";
import { Button, Form, IconButton, Input, Stack } from "@uicore";
import { useState } from "react";
import { panelLogger } from "@modules/logger";
import { executeRequestInSync } from "@modules/app/requestExecutor";
import { GenerationDBDataProps } from "@modules/documentationEditor/types";

interface Props {
  history: GenerationDBDataProps;
}

enum Rating {
  Bad = "bad",
  Good = "good",
}
const schema = Yup.object({
  rating: Yup.mixed<Rating>().oneOf(Object.values(Rating)).required(),
  comment: Yup.string().required(),
}).required();

interface FormProps {
  rating: Rating;
  comment: string;
}
const ResultFeedbackButtons = ({ history }: Props): JSX.Element => {
  const [showForm, setShowForm] = useState(false);

  const { control, handleSubmit, setValue } = useForm<FormProps>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    panelLogger.info("feedback submitted", data);

    await executeRequestInSync("sendFeedback", {
      data: {
        column: history.data.name,
        description: history.data.description,
        model: history.model,
      },
      ...data,
    });
  };

  const handleClick = (isLiked: boolean) => {
    setShowForm(true);
    setValue("rating", isLiked ? Rating.Good : Rating.Bad);
  };

  return (
    <Stack direction="column">
      <Stack>
        <IconButton title="Like" onClick={() => handleClick(true)}>
          <LikeIcon />
        </IconButton>
        <IconButton title="Dislike" onClick={() => handleClick(false)}>
          <DislikeIcon />
        </IconButton>
      </Stack>
      {showForm ? (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="column">
            <h5>AI still needs humans sometimes, please help it out 🙂</h5>
            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange } }) => (
                <Input type="textarea" onChange={onChange} />
              )}
            />
            <Stack>
              <Button color="primary" type="submit">
                Submit
              </Button>
              <Button onClick={() => setShowForm(false)}>Cancel</Button>
            </Stack>
          </Stack>
        </Form>
      ) : null}
    </Stack>
  );
};

export default ResultFeedbackButtons;
