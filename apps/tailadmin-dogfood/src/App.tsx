import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import BasicTables from "./pages/Tables/BasicTables";
import Badges from "./pages/UiElements/Badges";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/" element={<Home />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/badge" element={<Badges />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
