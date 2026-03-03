import type { CodingQuestion } from "@/lib/types"

export const codingQuestions: CodingQuestion[] = [
  {
    id: "code-1",
    title: "Two Sum",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.\n\n**Example:**\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
    starterCode: "function twoSum(nums, target) {\n  // Your code here\n}",
    expectedOutput: "Return an array of two indices",
    topic: "Arrays",
    difficulty: "easy",
    hints: [
      "Think about using a hash map to store seen values",
      "For each number, check if target - number exists in the map",
    ],
  },
  {
    id: "code-2",
    title: "Reverse a String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\n**Example:**\nInput: ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']",
    starterCode:
      "function reverseString(s) {\n  // Your code here\n  // Modify s in-place\n}",
    expectedOutput: "The array reversed in place",
    topic: "Strings",
    difficulty: "easy",
    hints: [
      "Use two pointers - one at the start and one at the end",
      "Swap characters and move pointers inward",
    ],
  },
  {
    id: "code-3",
    title: "Valid Parentheses",
    description:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nA string is valid if:\n- Open brackets are closed by the same type of brackets\n- Open brackets are closed in the correct order\n\n**Example:**\nInput: s = '([])'\nOutput: true",
    starterCode: "function isValid(s) {\n  // Your code here\n}",
    expectedOutput: "Return true or false",
    topic: "Stacks",
    difficulty: "easy",
    hints: [
      "Use a stack to keep track of opening brackets",
      "When you encounter a closing bracket, check if it matches the top of the stack",
    ],
  },
  {
    id: "code-4",
    title: "Fibonacci Number",
    description:
      "Calculate the nth Fibonacci number. The Fibonacci sequence is defined as:\n\nF(0) = 0, F(1) = 1\nF(n) = F(n-1) + F(n-2) for n > 1\n\n**Example:**\nInput: n = 6\nOutput: 8\nExplanation: 0, 1, 1, 2, 3, 5, 8",
    starterCode: "function fibonacci(n) {\n  // Your code here\n}",
    expectedOutput: "Return the nth Fibonacci number",
    topic: "Dynamic Programming",
    difficulty: "easy",
    hints: [
      "You can use iteration instead of recursion to avoid exponential time",
      "Keep track of the last two numbers",
    ],
  },
  {
    id: "code-5",
    title: "Maximum Subarray",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\n**Example:**\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has the largest sum = 6",
    starterCode: "function maxSubArray(nums) {\n  // Your code here\n}",
    expectedOutput: "Return the maximum subarray sum",
    topic: "Dynamic Programming",
    difficulty: "medium",
    hints: [
      "Think about Kadane's algorithm",
      "At each position, decide: extend the current subarray or start a new one",
    ],
  },
  {
    id: "code-6",
    title: "Linked List Cycle Detection",
    description:
      "Given an object representing a linked list node with `val` and `next` properties, determine if the linked list has a cycle.\n\nA cycle exists if some node can be reached again by continuously following the `next` pointer.\n\n**Example:**\nInput: head = {val: 3, next: {val: 2, next: {val: 0, next: {val: -4, next: [points back to node with val 2]}}}}\nOutput: true",
    starterCode:
      "function hasCycle(head) {\n  // Your code here\n  // Use Floyd's cycle detection\n}",
    expectedOutput: "Return true or false",
    topic: "Linked Lists",
    difficulty: "medium",
    hints: [
      "Use two pointers moving at different speeds (slow and fast)",
      "If there's a cycle, the fast pointer will eventually meet the slow pointer",
    ],
  },
  {
    id: "code-7",
    title: "Binary Search",
    description:
      "Given a sorted array of integers and a target value, return the index of the target. If not found, return -1.\n\nYou must implement this with O(log n) time complexity.\n\n**Example:**\nInput: nums = [-1, 0, 3, 5, 9, 12], target = 9\nOutput: 4",
    starterCode:
      "function binarySearch(nums, target) {\n  // Your code here\n}",
    expectedOutput: "Return the index of target or -1",
    topic: "Searching",
    difficulty: "easy",
    hints: [
      "Maintain left and right pointers",
      "Compare the middle element with target to decide which half to search",
    ],
  },
  {
    id: "code-8",
    title: "Merge Two Sorted Arrays",
    description:
      "Given two sorted arrays `arr1` and `arr2`, merge them into a single sorted array.\n\n**Example:**\nInput: arr1 = [1, 3, 5], arr2 = [2, 4, 6]\nOutput: [1, 2, 3, 4, 5, 6]",
    starterCode:
      "function mergeSorted(arr1, arr2) {\n  // Your code here\n}",
    expectedOutput: "Return a single sorted array",
    topic: "Arrays",
    difficulty: "easy",
    hints: [
      "Use two pointers, one for each array",
      "Compare elements at both pointers and push the smaller one",
    ],
  },
  {
    id: "code-9",
    title: "Palindrome Check",
    description:
      "Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.\n\n**Example:**\nInput: 'A man, a plan, a canal: Panama'\nOutput: true",
    starterCode: "function isPalindrome(s) {\n  // Your code here\n}",
    expectedOutput: "Return true or false",
    topic: "Strings",
    difficulty: "easy",
    hints: [
      "First clean the string: remove non-alphanumeric chars and convert to lowercase",
      "Then use two pointers from both ends",
    ],
  },
  {
    id: "code-10",
    title: "Longest Common Subsequence",
    description:
      "Given two strings `text1` and `text2`, return the length of their longest common subsequence. A subsequence is a sequence derived by deleting some (or no) characters without changing the order.\n\n**Example:**\nInput: text1 = 'abcde', text2 = 'ace'\nOutput: 3\nExplanation: The LCS is 'ace'.",
    starterCode:
      "function longestCommonSubsequence(text1, text2) {\n  // Your code here\n}",
    expectedOutput: "Return the length of the LCS",
    topic: "Dynamic Programming",
    difficulty: "hard",
    hints: [
      "Use a 2D DP table where dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]",
      "If characters match, dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1])",
    ],
  },
]
