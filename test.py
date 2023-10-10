import sys;

def len_sum(a, b): 
 return len(a)+len(b)

if __name__ == "__main__":
    a=sys.argv[1]
    b=sys.argv[2]
    result=int(sys.argv[3])
    print(len_sum(a,b))