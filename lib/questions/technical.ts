import type { Question } from "@/lib/types"

export const technicalQuestions: Question[] = [
  {
    id: "tech-1",
    question: "What is the time complexity of searching in a balanced Binary Search Tree?",
    options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "easy",
    explanation: "In a balanced BST, the height is log(n), so searching takes O(log n) time.",
  },
  {
    id: "tech-2",
    question: "Which of the following is NOT a principle of Object-Oriented Programming?",
    options: ["Compilation", "Encapsulation", "Inheritance", "Polymorphism"],
    correctAnswer: 0,
    topic: "OOP",
    difficulty: "easy",
    explanation: "The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism. Compilation is not one of them.",
  },
  {
    id: "tech-3",
    question: "In SQL, which normal form eliminates transitive dependencies?",
    options: ["3NF", "1NF", "2NF", "BCNF"],
    correctAnswer: 0,
    topic: "DBMS",
    difficulty: "medium",
    explanation: "Third Normal Form (3NF) eliminates transitive dependencies where a non-key attribute depends on another non-key attribute.",
  },
  {
    id: "tech-4",
    question: "What is a deadlock in operating systems?",
    options: [
      "A situation where processes wait indefinitely for resources held by each other",
      "A process that runs forever",
      "A memory allocation failure",
      "A CPU scheduling algorithm"
    ],
    correctAnswer: 0,
    topic: "OS",
    difficulty: "easy",
    explanation: "A deadlock occurs when two or more processes are waiting for resources that are held by each other, creating a circular wait.",
  },
  {
    id: "tech-5",
    question: "Which data structure is used for BFS traversal of a graph?",
    options: ["Queue", "Stack", "Heap", "Array"],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "easy",
    explanation: "BFS uses a queue to process nodes level by level.",
  },
  {
    id: "tech-6",
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "medium",
    explanation: "Quick Sort has O(n^2) worst case when the pivot is always the smallest or largest element.",
  },
  {
    id: "tech-7",
    question: "What does ACID stand for in database management?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Atomicity, Concurrency, Isolation, Durability",
      "Accuracy, Consistency, Isolation, Dependency",
      "Atomicity, Consistency, Integration, Durability"
    ],
    correctAnswer: 0,
    topic: "DBMS",
    difficulty: "easy",
    explanation: "ACID properties ensure reliable transaction processing: Atomicity, Consistency, Isolation, and Durability.",
  },
  {
    id: "tech-8",
    question: "Which protocol operates at the Transport Layer of the OSI model?",
    options: ["TCP", "HTTP", "IP", "ARP"],
    correctAnswer: 0,
    topic: "Networking",
    difficulty: "easy",
    explanation: "TCP operates at Layer 4 (Transport Layer). HTTP is Application Layer, IP is Network Layer.",
  },
  {
    id: "tech-9",
    question: "What is the difference between a process and a thread?",
    options: [
      "A process has its own address space; threads share the process's address space",
      "A thread has its own address space; processes share address space",
      "There is no difference",
      "Processes are faster than threads"
    ],
    correctAnswer: 0,
    topic: "OS",
    difficulty: "medium",
    explanation: "Processes have independent memory spaces. Threads within the same process share memory, making inter-thread communication faster.",
  },
  {
    id: "tech-10",
    question: "Which of the following is true about a Hash Table?",
    options: [
      "Average case lookup is O(1)",
      "Worst case lookup is O(1)",
      "It maintains sorted order",
      "It cannot handle collisions"
    ],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "medium",
    explanation: "Hash tables provide O(1) average case for lookup, insert, and delete. Worst case is O(n) due to collisions.",
  },
  {
    id: "tech-11",
    question: "What is method overloading vs method overriding in OOP?",
    options: [
      "Overloading: same name, different params in same class. Overriding: same signature in subclass.",
      "They are the same thing",
      "Overloading: different name, same params. Overriding: different params in subclass.",
      "Overloading happens at runtime, Overriding at compile time."
    ],
    correctAnswer: 0,
    topic: "OOP",
    difficulty: "medium",
    explanation: "Overloading is compile-time polymorphism (same method name, different parameters). Overriding is runtime polymorphism (same signature in parent and child class).",
  },
  {
    id: "tech-12",
    question: "What is the purpose of an index in a database?",
    options: [
      "To speed up data retrieval operations",
      "To encrypt data",
      "To backup the database",
      "To normalize the database"
    ],
    correctAnswer: 0,
    topic: "DBMS",
    difficulty: "easy",
    explanation: "An index creates a data structure that allows the database to find rows faster without scanning the entire table.",
  },
  {
    id: "tech-13",
    question: "What is virtual memory?",
    options: [
      "A memory management technique that uses disk space to extend RAM",
      "Memory on the GPU",
      "Cache memory",
      "ROM memory"
    ],
    correctAnswer: 0,
    topic: "OS",
    difficulty: "medium",
    explanation: "Virtual memory uses a portion of the hard drive as an extension of RAM, allowing programs to use more memory than physically available.",
  },
  {
    id: "tech-14",
    question: "In a linked list, what is the time complexity of inserting at the beginning?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "easy",
    explanation: "Inserting at the beginning only requires changing the head pointer, which is O(1).",
  },
  {
    id: "tech-15",
    question: "What is the difference between TCP and UDP?",
    options: [
      "TCP is connection-oriented and reliable; UDP is connectionless and faster",
      "UDP is reliable; TCP is not",
      "They are identical protocols",
      "TCP is used for video streaming; UDP for file transfer"
    ],
    correctAnswer: 0,
    topic: "Networking",
    difficulty: "medium",
    explanation: "TCP provides reliable, ordered delivery with error checking. UDP is faster but doesn't guarantee delivery or order.",
  },
  {
    id: "tech-16",
    question: "What is the output of a postorder traversal of a Binary Tree?",
    options: [
      "Left, Right, Root",
      "Root, Left, Right",
      "Left, Root, Right",
      "Right, Left, Root"
    ],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "easy",
    explanation: "Postorder traversal visits the left subtree, then right subtree, then the root node.",
  },
  {
    id: "tech-17",
    question: "What is an abstract class in OOP?",
    options: [
      "A class that cannot be instantiated and may have abstract methods",
      "A class with no methods",
      "A class with only static methods",
      "A class that is always final"
    ],
    correctAnswer: 0,
    topic: "OOP",
    difficulty: "easy",
    explanation: "An abstract class provides a blueprint for subclasses. It cannot be instantiated directly and may contain abstract methods that must be implemented by subclasses.",
  },
  {
    id: "tech-18",
    question: "What is a JOIN in SQL?",
    options: [
      "A clause to combine rows from two or more tables based on a related column",
      "A way to delete data",
      "A function to create tables",
      "A method to backup databases"
    ],
    correctAnswer: 0,
    topic: "DBMS",
    difficulty: "easy",
    explanation: "JOIN combines rows from multiple tables based on a related column, allowing you to query related data across tables.",
  },
  {
    id: "tech-19",
    question: "What scheduling algorithm gives the shortest average waiting time?",
    options: [
      "Shortest Job First (SJF)",
      "First Come First Served (FCFS)",
      "Round Robin",
      "Priority Scheduling"
    ],
    correctAnswer: 0,
    topic: "OS",
    difficulty: "medium",
    explanation: "SJF (non-preemptive) gives the minimum average waiting time among all scheduling algorithms.",
  },
  {
    id: "tech-20",
    question: "What is the space complexity of Merge Sort?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"],
    correctAnswer: 0,
    topic: "DSA",
    difficulty: "medium",
    explanation: "Merge Sort requires O(n) additional space for the temporary arrays used during merging.",
  },
]
