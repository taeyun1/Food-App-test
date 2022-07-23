const { pool } = require("../../config/database");

// 모든 식당 데이터 조회
exports.selectRestaurants = async function (connection, category) {
  const selectAllRestaurantsQuery = `SELECT title, address, category, videoUrl FROM Restaurants where status = 'A';`;
  const selectCategorizedRestaurantsQuery = `SELECT title, address, category, videoUrl FROM Restaurants where status = 'A' and category = ?;`;

  const Params = [category];

  // category값이 넘어오면 해당 카테고리의 목록을 보여주고, 아니면 전체 목록 보여주기
  const Query = category
    ? selectCategorizedRestaurantsQuery
    : selectAllRestaurantsQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

// 데이터베이스를 진짜 삭제하는게 아닌 status(상태)값을 "D"로 삭제됐다는 의미로 바꿔주기
// 요즘 데이터가 돈임, 상황에 따라 실제 삭제할 때도 있음
exports.deleteStudent = async function (connection, studentIdx) {
  const Query = `update Students set status = "D" where studentIdx = ?;`;
  const Params = [studentIdx];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.updateStudents = async function (
  connection,
  studentIdx,
  studentName,
  major,
  birth,
  address
) {
  // 업데이트할 컬럼들을 보낼수도 있고 안보낼 수도 있다.
  const Query = `update Students set studentName = ifnull(?, studentName), major = ifnull(?, major), birth = ifnull(?, birth), address = ifnull(?, address) where studentIdx = ?;`;
  const Params = [studentName, major, birth, address, studentIdx]; // 물음표 순서에 맞춰 params에 들어갈 값들을 정해줘야함

  const rows = await connection.query(Query, Params);

  return rows;
};

// 학생 인덱스 유효성 검사 (테이블에 studentIdx가 있어야하고, status가 A인 학생만 통과되게)
exports.isValidstudentIdx = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students where studentIdx = ? and status = 'A';`;
  const Params = [studentIdx];

  const [rows] = await connection.query(Query, Params);

  if (rows < 1) {
    return false;
  }
  return true;
};

exports.insertStudents = async function (
  connection,
  studentName,
  major,
  birth,
  address
) {
  const Query = `insert into Students(studentName, major, birth, address) values (?,?,?,?);`;
  const Params = [studentName, major, birth, address];

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.selectStudents = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students where studentIdx = ?;`;
  // const selectStudentByNameQuery = `SELECT * FROM Students where studentName = ?;`;
  const Params = [studentIdx];

  // studentName에 검색된게 있으면 그 학생 조회, 아니면 모든 학생이 조회
  // let Query = studentName ? selectStudentByNameQuery : selectAllStudentsQuery;

  const rows = await connection.query(Query, Params);

  return rows;
};

exports.exampleDao = async function (connection) {
  const Query = `SELECT * FROM Students;`;
  const Params = [];

  const rows = await connection.query(Query, Params);

  return rows;
};
