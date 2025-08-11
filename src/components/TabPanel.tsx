interface TabPanelProps {
  children?: React.ReactNode;

  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${props.index}`}
      aria-labelledby={`full-width-tab-${props.index}`}
      {...other}>
      {value === index && children}
    </div>
  );
};

export default TabPanel;
