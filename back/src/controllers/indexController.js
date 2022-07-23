const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");

const indexDao = require("../dao/indexDao");

// 식당 조회
exports.readRestaurants = async (req, res) => {
  const { category } = req.query;

  // 카테고리 값이 넘어 왔다면, 유효한 값인지 체크
  if (category) {
    const validCategory = [
      "한식",
      "중식",
      "일식",
      "양식",
      "분식",
      "구이",
      "회/초밥",
      "기타",
    ];

    // 값이 넘어온 category가 validCategory에 없으면
    if (!validCategory.includes(category)) {
      return res.send({
        isSuccess: false,
        code: 400, // 요청 실패시 400번대 코드
        message: "유효한 카테고리가 아닙니다.",
      });
    }
  }

  try {
    // mySQL에 접근할수있는 하나의 객체
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // mySQL에 접속과 관련된 부분을 정의하는 함수부분
      const [rows] = await indexDao.selectRestaurants(connection, category);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "식당 목록 요청 성공",
      });
    } catch (err) {
      logger.error(`readRestaurants Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(
      `readRestaurants DB Connection error\n: ${JSON.stringify(err)}`
    );
    return false;
  }
};

// 학생 삭제
exports.deleteStudent = async (req, res) => {
  const { studentIdx } = req.params;

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const isValidstudentIdx = await indexDao.isValidstudentIdx(
        connection,
        studentIdx
      );

      if (!isValidstudentIdx) {
        return res.send({
          isSuccess: false,
          code: 410, // 실패시
          message: "유효한 학생 인덱스가 아닙니다.",
        });
      }

      const [rows] = await indexDao.deleteStudent(connection, studentIdx);

      return res.send({
        isSuccess: true,
        code: 200, // 성공시
        message: "삭제 성공",
      });
    } catch (err) {
      logger.error(`deleteStudent Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`deleteStudent DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 학생 업데이트
// 업데이트할 컬럼들을 보낼수도 있고 안보낼 수도 있다.
exports.updateStudent = async (req, res) => {
  const { studentName, major, birth, address } = req.body;
  const { studentIdx } = req.params;

  // 유효성 검사
  if (studentName && typeof studentName !== "string") {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "값을 정확히 입력해주세요.",
    });
  }
  if (major && typeof major !== "string") {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "값을 정확히 입력해주세요.",
    });
  }
  if (address && typeof address !== "string") {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "값을 정확히 입력해주세요.",
    });
  }

  const regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
  if (birth && !regex.test(birth)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "날짜 형식을 확인해주세요.",
    });
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // 학생 인덱스 유효성 검사 (없으면 false)
      const isValidstudentIdx = await indexDao.isValidstudentIdx(
        connection,
        studentIdx
      );
      if (!isValidstudentIdx) {
        return res.send({
          isSuccess: false,
          code: 410, // 요청 실패시 400번대 코드
          message: "유효한 학생 인덱스가 아닙니다.",
        });
      }

      // mySQL에 접속과 관련된 부분을 정의하는 함수부분
      const [rows] = await indexDao.updateStudents(
        connection,
        studentIdx,
        studentName,
        major,
        birth,
        address
      );

      return res.send({
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "학생 수정 성공",
      });
    } catch (err) {
      logger.error(`updateStudent Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`updateStudent DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 학생 생성
exports.createStudent = async (req, res) => {
  const { studentName, major, birth, address } = req.body;

  // studentName, major, address : 문자열
  if (
    typeof studentName !== "string" ||
    typeof major !== "string" ||
    typeof address !== "string"
  ) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "값을 정확히 입력해주세요.",
    });
  }
  // birth : YYYY-MM-DD 형식 검사
  // console.log(regex.test("2020-09-25")); // 형식이 맞으면 true, 아니면 false 반환

  const regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);
  if (!regex.test(birth)) {
    return res.send({
      isSuccess: false,
      code: 400, // 요청 실패시 400번대 코드
      message: "날짜 형식을 확인해주세요.",
    });
  }

  try {
    // mySQL에 접근할수있는 하나의 객체
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // mySQL에 접속과 관련된 부분을 정의하는 함수부분
      const [rows] = await indexDao.insertStudents(
        connection,
        studentName,
        major,
        birth,
        address
      );

      return res.send({
        // result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "학생 생성 성공",
      });
    } catch (err) {
      logger.error(`createStudent Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`createStudent DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 학생 테이블 조회
exports.readStudents = async (req, res) => {
  // const { studentName } = req.query; // req에 담겨있는 query객체에서 studentName값을 빼오겠다
  // const studentName = req.query.studentName; 위랑 같음 (위는 비구조할당)
  const { studentIdx } = req.params;

  try {
    // mySQL에 접근할수있는 하나의 객체
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // mySQL에 접속과 관련된 부분을 정의하는 함수부분
      const [rows] = await indexDao.selectStudents(connection, studentIdx);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "요청 성공",
      });
    } catch (err) {
      logger.error(`readStudents Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`readStudents DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};

// 예시 코드
exports.example = async function (req, res) {
  try {
    // mySQL에 접근할수있는 하나의 객체
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      // mySQL에 접속과 관련된 부분을 정의하는 함수부분
      const [rows] = await indexDao.exampleDao(connection);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200, // 요청 실패시 400번대 코드
        message: "요청 성공",
      });
    } catch (err) {
      logger.error(`example Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`example DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};
