import { useQuery } from '@tanstack/react-query';
import { fetchCharacters } from '../api/characters';
import { useSearch, useNavigate } from '@tanstack/react-router';
import type { Character } from '../types/character';
import styles from './styles/CharacterList.module.css';

export default function CharacterList() {
  const { page = '1' } = useSearch({ strict: false });
  const pageNum = parseInt(page);
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['characters', pageNum],
    queryFn: () => fetchCharacters(pageNum),
  });

  const handleRefresh = () => query.refetch();

  const data: Character[] = query.data ? query.data.results : [];

  if (query.isLoading) return <div className={styles.loading}>Loading...</div>;
  if (query.error) return <div className={styles.error}>Error loading characters: {String(query.error)}</div>;
  if (!query.data) return <div className={styles.error}>No data found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Star Wars Characters (Page {pageNum})</h1>
        <button className={styles.refreshButton} onClick={handleRefresh}>🔄 Refresh</button>
      </div>
      <div className={styles.cardGrid}>
        {data.map(character => (
          <div key={character.id} className={styles.card}>
            <img src={character.image} alt={character.name} className={styles.cardImage} />
            <div className={styles.cardContent}>
              <div className={styles.cardTitleRow}>
                <span className={styles.cardTitle}>{character.name}</span>
                <span className={styles.statusRow}>
                  <span className={
                    character.status === 'Alive' ? styles.statusDotAlive :
                    character.status === 'Dead' ? styles.statusDotDead :
                    styles.statusDotUnknown
                  }></span>
                  <span className={styles.statusText}>{character.status} - {character.species}</span>
                </span>
              </div>
              <div className={styles.cardField}><span>Gender:</span> <span>{character.gender}</span></div>
              <div className={styles.cardField}><span>Last known location:</span> <span>{character.location?.name}</span></div>
              <div className={styles.cardField}><span>First seen in:</span> <span>{(character as any).firstSeen || '-'}</span></div>
              <button className={styles.detailsButton} onClick={() => navigate({ to: `/character/${character.id}` })}>Details</button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.paginationRow}>
        <button
          className={styles.paginationBtn}
          onClick={() => navigate({ to: `/?page=${pageNum - 1}` })}
          disabled={pageNum === 1}
        >
          ⬅ Prev
        </button>
        <span className={styles.paginationInfo}>Page {pageNum} of {query.data?.info.pages}</span>
        <button
          className={styles.paginationBtn}
          onClick={() => navigate({ to: `/?page=${pageNum + 1}` })}
          disabled={pageNum === query.data?.info.pages}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}