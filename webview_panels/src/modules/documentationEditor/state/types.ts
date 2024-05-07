import { ConversationGroup, DbtDocsShareDetails } from "@lib";
import { GenerationDBDataProps } from "../types";

export enum Source {
  DATABASE = "DATABASE",
  YAML = "YAML",
}

export enum Pages {
  DOCUMENTATION,
  TESTS,
  TAGS,
}
export interface MetadataColumn {
  name: string;
  type?: string;
}

export interface DBTDocumentationColumn extends MetadataColumn {
  description?: string;
  generated: boolean;
  source: Source;
}

export interface DBTDocumentation {
  name: string;
  description: string;
  columns: DBTDocumentationColumn[];
  generated: boolean;
  aiEnabled: boolean;
  patchPath?: string;
  resource_type: string;
  uniqueId: string;
}

export interface TestMetadataKwArgs {
  column_name: string;
  model: string;
}

export enum DbtTestTypes {
  EXTERNAL_PACKAGE = "external",
  GENERIC = "generic",
  MACRO = "macro",
  SINGULAR = "singular", // sql queries in dbt tests directory
  UNKNOWN = "unknown",
}

export enum DbtGenericTests {
  ACCEPTED_VALUES = "accepted_values",
  NOT_NULL = "not_null",
  RELATIONSHIPS = "relationships",
  UNIQUE = "unique",
}

// for accepted_values
export interface TestMetadataAcceptedValuesKwArgs extends TestMetadataKwArgs {
  values?: string[];
}

// for relationship
export interface TestMetadataRelationshipsKwArgs extends TestMetadataKwArgs {
  field?: string;
  to?: string;
}

export interface DocumentationStateProps {
  incomingDocsData?: DBTDocumentation;
  currentDocsData?: DBTDocumentation;
  currentDocsTests?: DBTModelTest[];
  project?: string;
  currentFilePath?: string;
  generationHistory: GenerationDBDataProps[];
  userInstructions: DocsGenerateUserInstructions;
  isDocGeneratedForAnyColumn: boolean;
  isTestUpdatedForAnyColumn: boolean;
  insertedEntityName?: string;
  selectedPages: Pages[];
  conversations: Record<DbtDocsShareDetails["share_id"], ConversationGroup[]>;
  showConversationsRightPanel: boolean;
  selectedConversationGroup?: {
    shareId: DbtDocsShareDetails["share_id"];
    conversationGroupId: ConversationGroup["conversation_group_id"];
  };
  collaborationEnabled: boolean;
}

export interface DBTModelTest {
  alias: string;
  column_name?: string;
  database: string;
  key: string;
  path: string;
  schema: string;
  test_metadata?: {
    kwargs: TestMetadataAcceptedValuesKwArgs | TestMetadataRelationshipsKwArgs;
    name: string;
    namespace?: string;
  };
}

export interface DocsGenerateFollowupInstructions {
  instruction?: string;
}

export interface DocsGenerateUserInstructions {
  prompt_hint?: string;
  language?: string;
  persona?: string;
}

export interface DocsGenerateModelRequestV2 {
  user_instructions?: DocsGenerateUserInstructions;
  follow_up_instructions?: DocsGenerateFollowupInstructions;
  description?: string;
  columns?: string[];
}

export interface DocsGenerateColumnRequestV2 {
  user_instructions: DocsGenerateUserInstructions;
  description?: string;
  columnName: string;
}
