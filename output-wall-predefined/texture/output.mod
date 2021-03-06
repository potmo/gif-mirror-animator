MODULE MainModule
  PERS wobjdata platform := [ FALSE, TRUE, "", [ [800, 0, 600], [1, 0, 0 ,0] ], [ [0, 0, 0], [1, 0, 0 ,0] ] ];
  PERS tooldata pen := [ TRUE, [[0, 0, 100], [1, 0, 0 ,0]], [0.8,[0, 0, 30], [1, 0, 0, 0], 0, 0, 0]];
  PROC main()
    ConfL\Off;
    ConfJ\Off;
    SingArea\Wrist;
    !!-0.26, 0.006499999999999978;
    MoveL [ [4.847, -13.139, 47.960], [0.142, -0.923, -0.358, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.260, 0.006, -0.010], [0.142, -0.923, -0.358, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [4.847, -13.139, 47.960], [0.142, -0.923, -0.358, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.14291336540834393, 0.006499999999999978;
    MoveL [ [0.818, -10.476, 48.869], [0.106, -0.990, -0.091, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.143, 0.006, -0.010], [0.106, -0.990, -0.091, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [0.818, -10.476, 48.869], [0.106, -0.990, -0.091, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.025826730816687793, 0.006499999999999978;
    MoveL [ [-2.383, -8.569, 49.193], [0.089, -0.960, 0.264, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.026, 0.006, -0.010], [0.089, -0.960, 0.264, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-2.383, -8.569, 49.193], [0.089, -0.960, 0.264, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.09125990377496834, 0.006499999999999978;
    MoveL [ [-4.851, -7.182, 49.223], [0.088, -0.821, 0.564, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.091, 0.006, -0.010], [0.088, -0.821, 0.564, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.851, -7.182, 49.223], [0.088, -0.821, 0.564, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.20834653836662445, 0.006499999999999978;
    MoveL [ [-4.828, -7.191, 49.212], [0.088, -0.816, 0.571, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.208, 0.006, -0.010], [0.088, -0.816, 0.571, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.828, -7.191, 49.212], [0.088, -0.816, 0.571, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.20145668270417197, -0.09490000000000001;
    MoveL [ [6.517, -4.884, 49.305], [0.083, -0.578, -0.812, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.201, -0.095, -0.010], [0.083, -0.578, -0.812, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [6.517, -4.884, 49.305], [0.083, -0.578, -0.812, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.08437004811251585, -0.09490000000000001;
    MoveL [ [-4.501, -2.632, 49.730], [0.051, -0.498, 0.866, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.084, -0.095, -0.010], [0.051, -0.498, 0.866, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.501, -2.632, 49.730], [0.051, -0.498, 0.866, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.03271658647914029, -0.09490000000000001;
    MoveL [ [6.610, 4.043, 49.382], [0.078, 0.531, -0.844, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.033, -0.095, -0.010], [0.078, 0.531, -0.844, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [6.610, 4.043, 49.382], [0.078, 0.531, -0.844, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.14980322107079638, -0.09490000000000001;
    MoveL [ [-1.740, 2.468, 49.889], [0.032, 0.805, 0.593, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.150, -0.095, -0.010], [0.032, 0.805, 0.593, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-1.740, 2.468, 49.889], [0.032, 0.805, 0.593, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.26, -0.19630000000000006;
    MoveL [ [1.787, -3.764, 49.821], [0.041, -0.867, -0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.260, -0.196, -0.010], [0.041, -0.867, -0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [1.787, -3.764, 49.821], [0.041, -0.867, -0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.14291336540834393, -0.19630000000000006;
    MoveL [ [-1.798, -3.081, 49.879], [0.033, -0.867, 0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.143, -0.196, -0.010], [0.033, -0.867, 0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-1.798, -3.081, 49.879], [0.033, -0.867, 0.497, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.025826730816687793, -0.19630000000000006;
    MoveL [ [1.835, 3.183, 49.841], [0.039, 0.875, -0.482, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.026, -0.196, -0.010], [0.039, 0.875, -0.482, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [1.835, 3.183, 49.841], [0.039, 0.875, -0.482, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.09125990377496834, -0.19630000000000006;
    MoveL [ [-4.462, 2.048, 49.732], [0.051, 0.442, 0.896, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.091, -0.196, -0.010], [0.051, 0.442, 0.896, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.462, 2.048, 49.732], [0.051, 0.442, 0.896, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.20834653836662445, -0.19630000000000006;
    MoveL [ [-4.438, 2.051, 49.723], [0.052, 0.435, 0.899, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.208, -0.196, -0.010], [0.052, 0.435, 0.899, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.438, 2.051, 49.723], [0.052, 0.435, 0.899, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.20145668270417197, -0.2977000000000001;
    MoveL [ [1.804, -3.688, 49.835], [0.039, -0.860, -0.509, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.201, -0.298, -0.010], [0.039, -0.860, -0.509, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [1.804, -3.688, 49.835], [0.039, -0.860, -0.509, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.08437004811251585, -0.2977000000000001;
    MoveL [ [-1.784, -3.028, 49.886], [0.032, -0.849, 0.528, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.084, -0.298, -0.010], [0.032, -0.849, 0.528, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-1.784, -3.028, 49.886], [0.032, -0.849, 0.528, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.03271658647914029, -0.2977000000000001;
    MoveL [ [1.838, 3.266, 49.830], [0.040, 0.891, -0.451, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.033, -0.298, -0.010], [0.040, 0.891, -0.451, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [1.838, 3.266, 49.830], [0.040, 0.891, -0.451, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.14980322107079638, -0.2977000000000001;
    MoveL [ [-4.452, 2.088, 49.721], [0.052, 0.460, 0.887, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.150, -0.298, -0.010], [0.052, 0.460, 0.887, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.452, 2.088, 49.721], [0.052, 0.460, 0.887, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.26, -0.39910000000000007;
    MoveL [ [4.883, 12.530, 48.015], [0.141, 0.920, -0.366, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.260, -0.399, -0.010], [0.141, 0.920, -0.366, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [4.883, 12.530, 48.015], [0.141, 0.920, -0.366, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.14291336540834393, -0.39910000000000007;
    MoveL [ [0.839, 9.895, 48.909], [0.104, 0.990, -0.094, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.143, -0.399, -0.010], [0.104, 0.990, -0.094, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [0.839, 9.895, 48.909], [0.104, 0.990, -0.094, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.025826730816687793, -0.39910000000000007;
    MoveL [ [-2.371, 8.009, 49.222], [0.088, 0.960, 0.268, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.026, -0.399, -0.010], [0.088, 0.960, 0.268, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-2.371, 8.009, 49.222], [0.088, 0.960, 0.268, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.09125990377496834, -0.39910000000000007;
    MoveL [ [-4.844, 6.637, 49.246], [0.086, 0.816, 0.572, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.091, -0.399, -0.010], [0.086, 0.816, 0.572, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.844, 6.637, 49.246], [0.086, 0.816, 0.572, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.20834653836662445, -0.39910000000000007;
    MoveL [ [-4.821, 6.645, 49.235], [0.087, 0.811, 0.579, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.208, -0.399, -0.010], [0.087, 0.811, 0.579, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.821, 6.645, 49.235], [0.087, 0.811, 0.579, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.20145668270417197, -0.5005000000000002;
    MoveL [ [4.861, 12.639, 47.966], [0.142, 0.924, -0.356, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.201, -0.501, -0.010], [0.142, 0.924, -0.356, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [4.861, 12.639, 47.966], [0.142, 0.924, -0.356, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!-0.08437004811251585, -0.5005000000000002;
    MoveL [ [0.829, 9.972, 48.873], [0.106, 0.991, -0.086, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [-0.084, -0.501, -0.010], [0.106, 0.991, -0.086, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [0.829, 9.972, 48.873], [0.106, 0.991, -0.086, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.03271658647914029, -0.5005000000000002;
    MoveL [ [-2.372, 8.063, 49.193], [0.089, 0.959, 0.269, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.033, -0.501, -0.010], [0.089, 0.959, 0.269, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-2.372, 8.063, 49.193], [0.089, 0.959, 0.269, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
    !!0.14980322107079638, -0.5005000000000002;
    MoveL [ [-4.839, 6.675, 49.220], [0.088, 0.818, 0.569, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    MoveL [ [0.150, -0.501, -0.010], [0.088, 0.818, 0.569, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v30, fine, pen\WObj:=platform;
    MoveL [ [-4.839, 6.675, 49.220], [0.088, 0.818, 0.569, 0.000], [0, 0, 0, 0], [ 9E9, 9E9, 9E9, 9E9, 9E9, 9E9] ], v1000, fine, pen\WObj:=platform;
    
  ENDPROC
ENDMODULE