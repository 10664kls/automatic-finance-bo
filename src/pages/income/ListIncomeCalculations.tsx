import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import TabPanel from "../../components/TabPanel";
import TabIncomeCalculationBySalary from "../../components/TabIncomeCalculationBySalary";
import TabIncomeCalculationBySelfEmployed from "../../components/TabIncomeCalculationBySelfEmployed";
import { useSearchParams } from "react-router-dom";

const ListIncomeCalculations = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    switch (searchParams.get("type")) {
      case "salary":
        setTabValue(0);
        break;

      case "self-employed":
        setTabValue(1);
        break;

      default:
        setTabValue(0); // optional fallback
        break;
    }
  }, [searchParams]);

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <Tabs
        onChange={(_, newValue) => {
          setTabValue(newValue);
          setSearchParams("");
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
        <TabIncomeCalculationBySalary />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TabIncomeCalculationBySelfEmployed />
      </TabPanel>
    </Box>
  );
};

export default ListIncomeCalculations;
