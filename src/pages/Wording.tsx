import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import TabPanel from "../components/TabPanel";
import TabSalaryWording from "../components/TabSalaryWording";
import TabSelfEmployedWording from "../components/TabSelfEmployedWording";

const Wording = () => {
  const [tabValue, setTabValue] = useState<number>(0);

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <Tabs
        onChange={(_, newValue) => {
          setTabValue(newValue);
        }}
        value={tabValue}
        aria-label="Tabs where each tab needs to be selected manually">
        <Tab
          label="Salary"
          value={0}
          id="full-width-tab-0"
          aria-controls="full-width-tabpanel-0"
        />
        <Tab
          label="Self Employment"
          value={1}
          id="full-width-tab-1"
          aria-controls="full-width-tabpanel-1"
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <TabSalaryWording />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TabSelfEmployedWording />
      </TabPanel>
    </Box>
  );
};

export default Wording;
