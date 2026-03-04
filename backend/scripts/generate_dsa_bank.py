import json
from pathlib import Path

OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "master_dsa_bank.json"

problems = [

    # ARRAYS
    {"title": "Two Sum", "url": "https://leetcode.com/problems/two-sum/", "difficulty": "Easy", "topics": ["Arrays", "Hashing"], "companies": ["Amazon", "Google", "Microsoft", "Meta"]},
    {"title": "Best Time to Buy and Sell Stock", "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", "difficulty": "Easy", "topics": ["Arrays"], "companies": ["Amazon", "Meta"]},
    {"title": "Maximum Subarray", "url": "https://leetcode.com/problems/maximum-subarray/", "difficulty": "Medium", "topics": ["Arrays", "Dynamic Programming"], "companies": ["Microsoft", "Google"]},
    {"title": "3Sum", "url": "https://leetcode.com/problems/3sum/", "difficulty": "Medium", "topics": ["Arrays", "Two Pointers"], "companies": ["Amazon", "Meta"]},
    {"title": "Trapping Rain Water", "url": "https://leetcode.com/problems/trapping-rain-water/", "difficulty": "Hard", "topics": ["Arrays", "Two Pointers"], "companies": ["Google", "Amazon"]},

    # STRINGS
    {"title": "Longest Substring Without Repeating Characters", "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/", "difficulty": "Medium", "topics": ["Strings", "Sliding Window"], "companies": ["Meta", "Amazon"]},
    {"title": "Valid Anagram", "url": "https://leetcode.com/problems/valid-anagram/", "difficulty": "Easy", "topics": ["Strings", "Hashing"], "companies": ["Microsoft", "Google"]},
    {"title": "Group Anagrams", "url": "https://leetcode.com/problems/group-anagrams/", "difficulty": "Medium", "topics": ["Strings", "Hashing"], "companies": ["Amazon", "Meta"]},
    {"title": "Minimum Window Substring", "url": "https://leetcode.com/problems/minimum-window-substring/", "difficulty": "Hard", "topics": ["Strings", "Sliding Window"], "companies": ["Google", "Meta"]},

    # LINKED LIST
    {"title": "Reverse Linked List", "url": "https://leetcode.com/problems/reverse-linked-list/", "difficulty": "Easy", "topics": ["Linked List"], "companies": ["Amazon", "Microsoft"]},
    {"title": "Merge Two Sorted Lists", "url": "https://leetcode.com/problems/merge-two-sorted-lists/", "difficulty": "Easy", "topics": ["Linked List"], "companies": ["Microsoft", "Meta"]},
    {"title": "LRU Cache", "url": "https://leetcode.com/problems/lru-cache/", "difficulty": "Hard", "topics": ["Linked List", "Design"], "companies": ["Amazon", "Google"]},

    # TREES
    {"title": "Maximum Depth of Binary Tree", "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/", "difficulty": "Easy", "topics": ["Tree", "DFS"], "companies": ["Amazon", "Microsoft"]},
    {"title": "Binary Tree Level Order Traversal", "url": "https://leetcode.com/problems/binary-tree-level-order-traversal/", "difficulty": "Medium", "topics": ["Tree", "BFS"], "companies": ["Microsoft", "Meta"]},
    {"title": "Lowest Common Ancestor of a Binary Tree", "url": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", "difficulty": "Medium", "topics": ["Tree"], "companies": ["Meta", "Google"]},
    {"title": "Serialize and Deserialize Binary Tree", "url": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", "difficulty": "Hard", "topics": ["Tree", "Design"], "companies": ["Google", "Amazon"]},

    # GRAPH
    {"title": "Number of Islands", "url": "https://leetcode.com/problems/number-of-islands/", "difficulty": "Medium", "topics": ["Graph", "DFS"], "companies": ["Google", "Meta"]},
    {"title": "Clone Graph", "url": "https://leetcode.com/problems/clone-graph/", "difficulty": "Medium", "topics": ["Graph", "DFS"], "companies": ["Amazon"]},
    {"title": "Course Schedule", "url": "https://leetcode.com/problems/course-schedule/", "difficulty": "Medium", "topics": ["Graph", "Topological Sort"], "companies": ["Google"]},
    {"title": "Word Ladder", "url": "https://leetcode.com/problems/word-ladder/", "difficulty": "Hard", "topics": ["Graph", "BFS"], "companies": ["Amazon", "Google"]},

    # DP
    {"title": "Climbing Stairs", "url": "https://leetcode.com/problems/climbing-stairs/", "difficulty": "Easy", "topics": ["Dynamic Programming"], "companies": ["Amazon"]},
    {"title": "Coin Change", "url": "https://leetcode.com/problems/coin-change/", "difficulty": "Medium", "topics": ["Dynamic Programming"], "companies": ["Microsoft", "Google"]},
    {"title": "Longest Increasing Subsequence", "url": "https://leetcode.com/problems/longest-increasing-subsequence/", "difficulty": "Medium", "topics": ["Dynamic Programming"], "companies": ["Microsoft"]},
    {"title": "Edit Distance", "url": "https://leetcode.com/problems/edit-distance/", "difficulty": "Hard", "topics": ["Dynamic Programming"], "companies": ["Google"]},

    # HEAP
    {"title": "Kth Largest Element in an Array", "url": "https://leetcode.com/problems/kth-largest-element-in-an-array/", "difficulty": "Medium", "topics": ["Heap"], "companies": ["Amazon"]},
    {"title": "Top K Frequent Elements", "url": "https://leetcode.com/problems/top-k-frequent-elements/", "difficulty": "Medium", "topics": ["Heap"], "companies": ["Google"]},

    # BACKTRACKING
    {"title": "Subsets", "url": "https://leetcode.com/problems/subsets/", "difficulty": "Medium", "topics": ["Backtracking"], "companies": ["Google"]},
    {"title": "Permutations", "url": "https://leetcode.com/problems/permutations/", "difficulty": "Medium", "topics": ["Backtracking"], "companies": ["Microsoft"]},
    {"title": "N-Queens", "url": "https://leetcode.com/problems/n-queens/", "difficulty": "Hard", "topics": ["Backtracking"], "companies": ["Amazon"]},

    # SYSTEM DESIGN STYLE
    {"title": "Design Twitter", "url": "https://leetcode.com/problems/design-twitter/", "difficulty": "Medium", "topics": ["Design"], "companies": ["Meta", "Google"]},
    {"title": "Design Search Autocomplete System", "url": "https://leetcode.com/problems/design-search-autocomplete-system/", "difficulty": "Hard", "topics": ["Design", "Trie"], "companies": ["Google"]},
]

with open(OUTPUT_PATH, "w") as f:
    json.dump(problems, f, indent=2)

print("DSA Bank Generated Successfully!")