import sys;

def num_check(a): 
  return 'Positive'

if __name__ == "__main__":
    a=int(sys.argv[1])
    result=sys.argv[2]
    print(num_check(a))