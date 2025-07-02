import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Table,
  Space,
  Input,
  Tag,
  Typography,
  Row,
  Col,
  Spin,
  Empty,
  Avatar,
  Divider,
  Button,
  Popconfirm,
  message,
} from "antd";
import {
  SearchOutlined,
  PieChartOutlined,
  BarChartOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Pie, Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import "./EnrichmentParticipants.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  getAllEnrichmentPrograms,
  getAllClasses,
  getStudentsByEnrichmentId,
  getEnrichmentInvoiceDetails,
  kickChildFromClass,
} from "./EnrichmentParticipantsService";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

const EnrichmentParticipants = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [programTypes, setProgramTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [paymentStatuses, setPaymentStatuses] = useState({}); // Track payment status
  const [processingKick, setProcessingKick] = useState({}); // Track kick status by student ID

  // Selection states
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null); // To track class ID for kick function

  // Chart data state
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);

  // Fetch all enrichment programs and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all enrichment programs
        const programsData = await getAllEnrichmentPrograms();
        setPrograms(programsData);

        // Get all classes
        const classesData = await getAllClasses();
        setClasses(classesData);

        // Extract unique program types from enrichment programs
        const types = [...new Set(programsData.map((program) => program.type))];
        setProgramTypes(types);

        // Create pie chart data using enrichment programs and classes
        createPieChartData(programsData, classesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create pie chart data showing distribution of students by program type
  const createPieChartData = (programsData, classesData) => {
    const programTypeData = {};

    // Initialize program types with zero counts
    programsData.forEach((program) => {
      if (!programTypeData[program.type]) {
        programTypeData[program.type] = {
          count: 0,
          color: getRandomColor(),
        };
      }
    });

    // Sum quantities from classes for each program type
    classesData.forEach((classItem) => {
      // Skip classes without enrichment program
      if (!classItem.epName) return;

      // Find the program for this class
      const program = programsData.find((p) => p.name === classItem.epName);
      if (program) {
        programTypeData[program.type].count += classItem.quantity || 0;
      }
    });

    // Create chart data
    const labels = Object.keys(programTypeData);
    const data = labels.map((type) => programTypeData[type].count);
    const backgroundColors = labels.map((type) => programTypeData[type].color);

    setPieChartData({
      labels: labels,
      datasets: [
        {
          label: "Số học sinh",
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    });
  };

  // Generate random colors for pie chart segments
  const getRandomColor = () => {
    const colors = [
      "rgba(76, 131, 255, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(130, 203, 141, 0.8)",
      "rgba(245, 135, 31, 0.8)",
      "rgba(116, 80, 228, 0.8)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Filter programs when type changes
  useEffect(() => {
    if (!selectedType || !programs.length) return;

    // Get all programs of selected type
    const programsOfType = programs.filter(
      (program) => program.type === selectedType
    );
    setFilteredPrograms(programsOfType);

    // Create bar chart data for filtered programs
    createBarChartData(programsOfType, classes);

    // Reset selected program when type changes
    setSelectedProgram(null);
    setStudents([]);
    setSelectedClass(null);
  }, [selectedType, programs, classes]);

  // Create bar chart data showing student distribution for programs of selected type
  const createBarChartData = (filteredProgramsData, classesData) => {
    // For each program, count total students from all classes with that epName
    const programWithStudents = filteredProgramsData.map((program) => {
      // Find all classes with this program's name as epName
      const classesForProgram = classesData.filter(
        (classItem) => classItem.epName === program.name
      );

      // Sum up quantities from all matching classes
      const studentCount = classesForProgram.reduce(
        (total, classItem) => total + (classItem.quantity || 0),
        0
      );

      return {
        ...program,
        studentCount,
      };
    });

    const labels = programWithStudents.map((program) => program.name);
    const data = programWithStudents.map((program) => program.studentCount);

    setBarChartData({
      labels: labels,
      datasets: [
        {
          label: "Số học sinh hiện tại",
          data: data,
          backgroundColor: "rgba(76, 131, 255, 0.8)",
          borderColor: "rgba(76, 131, 255, 1)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    });
  };

  // Fetch students when selected program changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedProgram) return;

      setLoading(true);
      try {
        const studentsData = await getStudentsByEnrichmentId(selectedProgram);
        setStudents(studentsData);
        
        // Find the class ID for this enrichment program
        const classForProgram = classes.find(c => 
          c.enrichmentProgramId === parseInt(selectedProgram)
        );
        if (classForProgram) {
          setSelectedClass(classForProgram.id);
        }
        
        // Reset payment statuses
        setPaymentStatuses({});
        
        // Check payment status for each student
        const statuses = {};
        for (const student of studentsData) {
          try {
            const invoices = await getEnrichmentInvoiceDetails(
              student.id,
              selectedProgram
            );
            // Check if any invoice has "Success" status
            const hasPaid = invoices.some((invoice) => invoice.status === "Success");
            statuses[student.id] = hasPaid;
          } catch (err) {
            console.error(`Error fetching payment status for student ${student.id}:`, err);
            statuses[student.id] = false;
          }
        }
        setPaymentStatuses(statuses);
        
      } catch (error) {
        console.error(
          `Error fetching students for program ID ${selectedProgram}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedProgram, classes]);

  // Handle kicking a student from class
  const handleKickStudent = async (studentId) => {
    if (!selectedClass || processingKick[studentId]) return;
    
    setProcessingKick((prev) => ({ ...prev, [studentId]: true }));
    try {
      await kickChildFromClass(studentId, selectedClass);
      message.success('Student removed from class');
      
      // Remove student from the list
      setStudents(students.filter(student => student.id !== studentId));
    } catch (error) {
      message.error('Could not remove student from class');
      console.error('Error kicking student:', error);
    } finally {
      setProcessingKick((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // Filtered students based on search text
  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      !searchText
  );

  // Table columns for students
  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Avatar src={avatar} size={40} />,
      width: "80px",
    },
    {
      title: "Full name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender === "Male" ? "Male" : gender === "Female" ? "Female" : "Other",
      filters: [
        { text: "Male", value: "Male" },
        { text: "Female", value: "Female" },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
      render: (date) =>
        date && date !== "0001-01-01T00:00:00"
          ? dayjs(date).format("DD/MM/YYYY")
          : "N/A",
      sorter: (a, b) => new Date(a.birthday) - new Date(b.birthday),
    },
    {
      title: "Enroll date",
      dataIndex: "enrollDate",
      key: "enrollDate",
      render: (date) =>
        date && date !== "0001-01-01T00:00:00"
          ? dayjs(date).format("DD/MM/YYYY")
          : "N/A",
      sorter: (a, b) => new Date(a.enrollDate) - new Date(b.enrollDate),
    },
    // New column for payment status
    {
      title: "Payment status",
      key: "paymentStatus",
      render: (_, record) => {
        if (paymentStatuses[record.id] === undefined) {
          return <Spin size="small" />;
        }
        return paymentStatuses[record.id] ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Paid
          </Tag>
        ) : (
          <Tag color="orange" icon={<DollarOutlined />}>
            Unpaid
          </Tag>
        );
      },
      filters: [
        { text: "Paid", value: true },
        { text: "Unpaid", value: false },
      ],
      onFilter: (value, record) => paymentStatuses[record.id] === value,
      width: "150px",
    },
    // Actions column
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        // Only show kick button if not paid
        if (!paymentStatuses[record.id]) {
          return (
            <Popconfirm
              title="Remove student from class?"
              description="Are you sure you want to remove this student from the class?"
              onConfirm={() => handleKickStudent(record.id)}
              okText="Yes"
              cancelText="Cancel"
            >
              <Button 
                danger 
                type="primary" 
                loading={processingKick[record.id]}
                icon={<CloseCircleOutlined />}
              >
                Remove from class
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
      width: "150px",
    },
  ];

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Student distribution by enrichment program type",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} students (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value, ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce(
            (a, b) => a + b,
            0
          );
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `Student distribution by enrichment program type ${selectedType || ""}`,
        font: {
          size: 18,
          weight: "bold",
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Current number of students: ${context.raw}`;
          },
        },
      },
      datalabels: {
        display: false, // Don't show labels on bar chart
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of students",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        ticks: {
          stepSize: 1, // Ensure integers
          precision: 0,
        },
      },
      x: {
        title: {
          display: true,
          text: "Enrichment program",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
  };

  return (
    <Card className="stats-card">
      <div className="header-section">
        <AntTitle level={2}>
          <PieChartOutlined className="section-icon" />
          Enrichment program statistics
        </AntTitle>
        <Text type="secondary" className="description-text">
          General and detailed information about the number of students participating in enrichment programs
        </Text>
      </div>

      {loading && !pieChartData ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        pieChartData && (
          <div className="pie-chart-container">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        )
      )}

      <Divider className="section-divider" />

      <div className="filter-section">
        <div className="section-header">
          <BarChartOutlined className="section-icon" />
          <Text strong>Filter data</Text>
        </div>
        <Row gutter={[64, 24]} className="filter-row">
          <Col xs={24} md={12}>
            <div className="filter-label">Enrichment program type:</div>
            <Select
              placeholder="Select enrichment program type"
              style={{ width: "100%" }}
              onChange={(value) => setSelectedType(value)}
              value={selectedType}
              className="styled-select"
            >
              {programTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Col>

          {selectedType && (
            <Col xs={24} md={12}>
              <div className="filter-label">Enrichment program:</div>
              <Select
                placeholder={`Select enrichment program ${selectedType}`}
                style={{ width: "100%" }}
                onChange={(value) => setSelectedProgram(value)}
                value={selectedProgram}
                className="styled-select"
              >
                {filteredPrograms.map((program) => (
                  <Option key={program.id} value={program.id}>
                    {program.name}
                    {program.isDelete && (
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Deleted
                      </Tag>
                    )}
                  </Option>
                ))}
              </Select>
            </Col>
          )}
        </Row>
      </div>

      {selectedType && (
        <div className="chart-section">
          {loading && !barChartData ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : barChartData ? (
            <div className="bar-chart-container">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          ) : (
            <Empty
              description="No data for this enrichment program type"
              className="styled-empty"
            />
          )}
        </div>
      )}

      {selectedProgram && (
        <>
          <Divider className="section-divider" />
          <div className="students-section">
            <div className="section-header">
              <TeamOutlined className="section-icon" />
              <Text strong>Student list</Text>
            </div>
            <div className="table-header">
              <AntTitle level={4} className="table-title">
                Students participating ({students.length})
                {filteredPrograms.find((p) => p.id === selectedProgram)
                  ?.isDelete && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    Deleted
                  </Tag>
                )}
              </AntTitle>
              <Space>
                <Input
                  placeholder="Search by name"
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="search-input"
                />
              </Space>
            </div>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredStudents}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "No students found" }}
                className="styled-table"
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default EnrichmentParticipants;
