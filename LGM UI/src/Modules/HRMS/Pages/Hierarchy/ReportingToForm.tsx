import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLevels } from "./Services/LevelService";
import {
  getEmployeeLevelSelectionList,
  setEmployeeReporting,
} from "../../Services/MasterDataService";
import Select from "react-select";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface Employee {
  id: number;
  fullName: string;
  //empName: string;
  levelID: number;
  levelName: string;
  levelOrder: number;
}

interface Level {
  id: number;
  levelName: string;
  levelOrder: number;
}

const ReportingToForm: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [reportingEmployees, setReportingEmployees] = useState<Employee[]>([]);
  const [reportingTo, setReportingTo] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empData, levelData] = await Promise.all([
        getEmployeeLevelSelectionList(),
        getLevels(),
      ]);

      setEmployees(empData);
      setLevels(levelData);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const handleEmployeeChange = (empId: number) => {
    const emp = employees.find((e) => e.id === empId) || null;

    setSelectedEmployee(emp);
    setSelectedLevel(null);
    setReportingEmployees([]);
    setReportingTo(null);

    if (!emp) return;

    const employeeLevel = levels.find((l) => l.id === emp.levelID);
    if (!employeeLevel) return;

    let allowedLevels: Level[] = [];

    if (employeeLevel.levelOrder === 1) {
      allowedLevels = levels.filter((l) => l.levelOrder === 1);
    } else {
      allowedLevels = levels.filter(
        (l) => l.levelOrder < employeeLevel.levelOrder,
      );
    }

    setAvailableLevels(allowedLevels);
  };

  const handleLevelChange = (levelId: number) => {
    setSelectedLevel(levelId);

    const filteredEmployees = employees.filter(
      (e) => e.levelID === levelId && e.id !== selectedEmployee?.id,
    );

    setReportingEmployees(filteredEmployees);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !reportingTo) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      await setEmployeeReporting(selectedEmployee.id, reportingTo);

      toast.success("Reporting hierarchy saved successfully");

      setSelectedEmployee(null);
      setSelectedLevel(null);
      setReportingEmployees([]);
      setReportingTo(null);
      setAvailableLevels([]);
    } catch {
      toast.error("Failed to save reporting hierarchy");
    }
  };

  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.fullName} (Level ${emp.levelOrder})`,
  }));

  const reportingOptions = reportingEmployees.map((emp) => ({
    value: emp.id,
    label: emp.fullName,
  }));

  return (
    <div className="p-6 max-w-lg space-y-4">
      {/* Employee */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Employee
        </label>

        <Select
          options={employeeOptions}
          placeholder="Search Employee..."
          value={
            selectedEmployee
              ? {
                  value: selectedEmployee.id,
                  label: `${selectedEmployee.fullName} (Level ${selectedEmployee.levelOrder})`,
                }
              : null
          }
          onChange={(option) => handleEmployeeChange(option?.value || 0)}
        />
        {/* <option value="">Select Employee</option>

          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.empName} (Level {emp.levelOrder})
            </option>
          ))}
        </select> */}
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Reporting Level
        </label>

        <select
          className="w-full border p-2 rounded"
          disabled={!selectedEmployee}
          value={selectedLevel || ""}
          onChange={(e) => handleLevelChange(Number(e.target.value))}
        >
          <option value="">Select Level</option>

          {availableLevels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.levelOrder} ({lvl.levelName})
            </option>
          ))}
        </select>
      </div>

      {/* Reporting Employee */}
      <div>
        <label className="block text-sm font-medium mb-1">Reporting To</label>

        <Select
          options={reportingOptions}
          placeholder="Search Manager..."
          isDisabled={!selectedLevel}
          value={
            reportingTo
              ? reportingOptions.find((opt) => opt.value === reportingTo)
              : null
          }
          onChange={(option) => setReportingTo(option?.value || null)}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className={buttonStyles.save}
      >
        Save Reporting
      </button>
    </div>
  );
};

export default ReportingToForm;
