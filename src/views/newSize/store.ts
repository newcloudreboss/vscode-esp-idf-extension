/*
 * Project: ESP-IDF VSCode Extension
 * File Created: Monday, 21st October 2024 3:23:34 pm
 * Copyright 2024 Espressif Systems (Shanghai) CO LTD
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineStore } from "pinia";
import { ref, Ref } from "vue";
import { IDFSizeArchive, IDFSizeOverview } from "../../espIdf/size/types";

declare var acquireVsCodeApi: any;
let vscode: any;
try {
  vscode = acquireVsCodeApi();
} catch (error) {
  console.error(error);
}

const SEC = 1000;

export const useNewSizeStore = defineStore("newSize", () => {
  const archives: Ref<{ [key: string]: IDFSizeArchive }> = ref({});
  const isFlashing: Ref<boolean> = ref(false);
  const isOverviewEnabled: Ref<boolean> = ref(true);
  const overviewData: Ref<IDFSizeOverview> = ref({
    version: "",
    layout: [],
  });
  const searchText: Ref<string> = ref("");

  function flashClicked() {
    if (vscode) {
      isFlashing.value = true;
      setTimeout(() => {
        isFlashing.value = false;
      }, 10 * SEC);
      vscode.postMessage({
        command: "flash",
      });
    }
  }

  function requestInitialValues() {
    vscode.postMessage({
      command: "requestInitialValues",
    });
  }

  function setFiles(files) {
    Object.keys(files).forEach((file) => {
      const lastColonIndex = file.lastIndexOf(":");
      const archiveName = file.substring(0, lastColonIndex);
      const fileName = file.substring(lastColonIndex + 1);
      if (archives.value[archiveName] && !archives.value[archiveName].files) {
        archives.value[archiveName].files = {};
      }
      archives.value[archiveName].files[fileName] = files[file];
    });
    Object.keys(archives.value).forEach((archive) => {
      archives.value[archive].isFileInfoVisible = false;
    });
  }

  function toggleArchiveFileInfoTable(archiveName: string) {
    Object.keys(archives.value).forEach((archive) => {
      let toggleVisibility = false;
      if (archive === archiveName) {
        toggleVisibility = !archives.value[archive].isFileInfoVisible;
      }
      archives.value[archive].isFileInfoVisible = toggleVisibility;
    });
  }

  return {
    archives,
    isFlashing,
    isOverviewEnabled,
    overviewData,
    searchText,
    flashClicked,
    setFiles,
    toggleArchiveFileInfoTable,
    requestInitialValues,
  };
});
