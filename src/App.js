import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import IconButton from "@mui/material/IconButton";
import backgroundImage from "./images/background1.jpeg";

const sessionKey = "f54489452479d073f2367834146b71da"; // Demo session key

const App = () => {
  const [dock, setDock] = useState("");
  const [tracker, setTracker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? "#3498db" : "#90caf9",
          },
          secondary: {
            main: mode === "light" ? "#2c3e50" : "#b39ddb",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#303030",
            paper: mode === "light" ? "#ffffff" : "#424242",
          },
        },
      }),
    [mode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dockList = [
    "Q4-a",
    "Q5-a",
    "Q5-b",
    "Q6-a",
    "Q6-b",
    "Q7-a",
    "Q7-b",
    "Q8-a",
    "Q8-b",
  ];

  const trackerList = [
    { name: "PAD 1", id: "875440" },
    { name: "PAD 2", id: "875453" },
    { name: "PAD 3", id: "875596" },
    { name: "PAD 4", id: "875602" },
    { name: "PAD 5", id: "875620" },
    { name: "PAD 6", id: "875827" },
    { name: "PAD 7", id: "875838" },
    { name: "PAD 9 RESERVE", id: "875848" },
    { name: "PAD 8 COLIS DENIS", id: "3068523" },
  ];

  const handleTaskReassignment = async () => {
    if (!dock || !tracker) {
      toast.error("Please select both a dock and a tracker.");
      return;
    }

    function formatDateToString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Get the current date and time
    const now = new Date();
    const todayDate = formatDateToString(now);

    setIsLoading(true);
    try {
      // Step 1: List all tasks
      const tasksResponse = await fetch(
        "https://api.navixy.com/v2/task/route/list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hash: sessionKey,
            trackers: [3123578],
            from: todayDate,
            statuses: ["assigned"],
          }),
        }
      );
      const tasksData = await tasksResponse.json();
      console.log("Tasks data:", tasksData);

      if (!tasksData.success) {
        toast.error("Failed to fetch tasks. Please try again.");
        return;
      }

      // Find the task that includes the selected dock in its name
      const matchingTask = tasksData.list.find((task) =>
        task.label.includes(`${dock}`)
      );

      console.log(matchingTask);

      if (!matchingTask) {
        toast.warning("No matching task found for the selected dock.");
        return;
      }
      // Step 2: Use the assign API to reassign the task
      const assignResponse = await fetch(
        `https://api.navixy.com/v2/task/route/assign?hash=${sessionKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            route_id: matchingTask.id,
            tracker_id: parseInt(tracker),
          }),
        }
      );

      const assignResult = await assignResponse.json();
      console.log("Assign result:", assignResult);

      if (assignResult.success) {
        toast.success("Task reassigned successfully!");
      } else {
        toast.error(
          "Failed to reassign the task. " +
            (assignResult.status?.description || "")
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: "40vh",
        width: "auto",
      },
    },
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const backgroundImageUrl = `${backgroundImage}?v=1`;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            py: 2,
            px: isMobile ? 2 : 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: isMobile ? 2 : 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor:
                mode === "light"
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(66, 66, 66, 0.9)",
            }}
          >
            <Box sx={{ alignSelf: "flex-end", mb: 2 }}>
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
            <Typography
              component="h1"
              variant={isMobile ? "h5" : "h4"}
              gutterBottom
              align="center"
            >
              Reassign Task to Vehicle
            </Typography>
            <Box component="form" noValidate sx={{ mt: 2, width: "100%" }}>
              <FormControl
                fullWidth
                margin="normal"
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="dock-select-label">Select Dock</InputLabel>
                <Select
                  labelId="dock-select-label"
                  id="dock-select"
                  value={dock}
                  label="Select Dock"
                  onChange={(e) => setDock(e.target.value)}
                  MenuProps={MenuProps}
                >
                  <MenuItem value="">
                    <em>Select a Dock</em>
                  </MenuItem>
                  {dockList.map((dock) => (
                    <MenuItem key={dock} value={dock}>
                      {dock}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                margin="normal"
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="tracker-select-label">
                  Select Tracker
                </InputLabel>
                <Select
                  labelId="tracker-select-label"
                  id="tracker-select"
                  value={tracker}
                  label="Select Tracker"
                  onChange={(e) => setTracker(e.target.value)}
                  MenuProps={MenuProps}
                >
                  <MenuItem value="">
                    <em>Select a Tracker</em>
                  </MenuItem>
                  {trackerList.map((tracker) => (
                    <MenuItem key={tracker.id} value={tracker.id}>
                      {tracker.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleTaskReassignment}
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: isMobile ? 1.5 : 2 }}
              >
                {isLoading ? "Processing..." : "Validate"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
      <ToastContainer position="top-center" autoClose={3000} />
    </ThemeProvider>
  );
};

export default App;
