import { NextResponse, type NextRequest } from "next/server";

const query = `
query getCourse($code: String) {
  course(where: {code: {_eq: $code}}) {
    ...CourseRating
  }
}

fragment CourseRating on course {
  rating {
    liked
    easy
    useful
    filled_count
    comment_count
  }
}
`;

export type UWFlowRating = {
  comment_count: number;
  easy: number;
  filled_count: number;
  liked: number;
  useful: number;
};

type UWFlowData = {
  data: {
    course: {
      rating: UWFlowRating;
    }[];
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseCode = searchParams.get("courseCode");

  if (courseCode === null) {
    return NextResponse.json(
      { error: "courseCode not provided" },
      { status: 400 }
    );
  }

  const uwFlowRes = await fetch("https://uwflow.com/graphql", {
    method: "POST",
    body: JSON.stringify({
      operationName: "getCourse",
      query,
      variables: { code: courseCode.toLowerCase() },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!uwFlowRes.ok) {
    return NextResponse.json(
      { error: "An error occurred while fetching UW Flow data" },
      { status: 400 }
    );
  }

  const uwFlowData = (await uwFlowRes.json()) as UWFlowData;

  return NextResponse.json(uwFlowData.data.course[0].rating);
}
