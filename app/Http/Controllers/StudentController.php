<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Student::all(),
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_number' => 'required|string|max:50|unique:students,student_number',
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'email'          => 'required|email|unique:students,email',
            'course'         => 'required|string|max:100',
            'year_level'     => 'required|integer|between:1,6',
        ]);

        $student = Student::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully.',
            'data' => $student,
        ], 201);
    }

    public function show(Student $student)
    {
        return response()->json([
            'success' => true,
            'data' => $student,
        ], 200);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'student_number' => ['required', 'string', 'max:50',
                Rule::unique('students')->ignore($student->id)],
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'email'          => ['required', 'email',
                Rule::unique('students')->ignore($student->id)],
            'course'         => 'required|string|max:100',
            'year_level'     => 'required|integer|between:1,6',
        ]);

        $student->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully.',
            'data' => $student,
        ], 200);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully.',
        ], 200);
    }
}